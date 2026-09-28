"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const riskHelper_1 = require("../utils/riskHelper");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
// GET /api/maintenance - Filtered by role category
router.get('/', async (req, res) => {
    try {
        const { status, priority, assetId } = req.query;
        const userCat = (0, authMiddleware_1.getUserCategoryFilter)(req.user);
        const where = {};
        if (userCat !== 'ALL') {
            where.asset = { assetType: userCat };
        }
        if (status && typeof status === 'string' && status !== 'ALL') {
            where.status = status;
        }
        if (priority && typeof priority === 'string' && priority !== 'ALL') {
            where.priority = priority;
        }
        if (assetId && typeof assetId === 'string') {
            where.assetId = assetId;
        }
        const maintenances = await prisma_1.prisma.maintenance.findMany({
            where,
            include: {
                asset: {
                    select: {
                        id: true,
                        assetCode: true,
                        name: true,
                        assetType: true,
                        district: true,
                        currentCondition: true,
                        criticality: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(maintenances);
    }
    catch (error) {
        console.error('Error fetching maintenance records:', error);
        res.status(500).json({ error: 'Failed to fetch maintenance work orders', details: error.message });
    }
});
// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const maintenance = await prisma_1.prisma.maintenance.findUnique({
            where: { id },
            include: { asset: true }
        });
        if (!maintenance)
            return res.status(404).json({ error: 'Maintenance record not found' });
        if (!(0, authMiddleware_1.canAccessCategory)(req.user, maintenance.asset.assetType)) {
            return res.status(403).json({
                error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets.`
            });
        }
        res.json(maintenance);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch maintenance', details: error.message });
    }
});
// POST /api/maintenance - Create Work Order
router.post('/', async (req, res) => {
    try {
        const { assetId, issue, priority = client_1.MaintenancePriority.MEDIUM, action, assignedTo, expectedCompletionDate, cost = 0, status = client_1.MaintenanceStatus.PENDING, beforePhotoUrl } = req.body;
        if (!assetId || !issue || !assignedTo) {
            return res.status(400).json({ error: 'Missing required maintenance fields (assetId, issue, assignedTo)' });
        }
        const asset = await prisma_1.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) {
            return res.status(404).json({ error: 'Target asset not found' });
        }
        if (!(0, authMiddleware_1.canAccessCategory)(req.user, asset.assetType)) {
            return res.status(403).json({
                error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot issue a work order for a ${asset.assetType}.`
            });
        }
        const newMaint = await prisma_1.prisma.maintenance.create({
            data: {
                assetId,
                issue,
                priority: priority,
                action: action || 'Inspection & Repair',
                assignedTo,
                expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : null,
                cost: parseFloat(cost) || 0,
                status: status,
                beforePhotoUrl: beforePhotoUrl || null
            }
        });
        if (status === client_1.MaintenanceStatus.IN_PROGRESS || status === client_1.MaintenanceStatus.ASSIGNED) {
            await prisma_1.prisma.asset.update({
                where: { id: assetId },
                data: { status: client_1.AssetStatus.UNDER_MAINTENANCE }
            });
        }
        let evType = client_1.EventType.MAINTENANCE_CREATED;
        if (status === client_1.MaintenanceStatus.IN_PROGRESS)
            evType = client_1.EventType.MAINTENANCE_STARTED;
        await prisma_1.prisma.lifecycleEvent.create({
            data: {
                assetId,
                eventType: evType,
                description: `Maintenance Work Order created [Priority: ${priority}]: ${issue}. Assigned to ${assignedTo}.`,
                performedBy: assignedTo
            }
        });
        const updatedRisk = await (0, riskHelper_1.recalculateAndSaveAssetRisk)(assetId);
        res.status(201).json({
            maintenance: newMaint,
            latestRisk: updatedRisk
        });
    }
    catch (error) {
        console.error('Error creating maintenance:', error);
        res.status(500).json({ error: 'Failed to create work order', details: error.message });
    }
});
// PUT /api/maintenance/:id - Update work order
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, action, assignedTo, expectedCompletionDate, actualCompletionDate, cost, beforePhotoUrl, afterPhotoUrl } = req.body;
        const existing = await prisma_1.prisma.maintenance.findUnique({
            where: { id },
            include: { asset: true }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Work order not found' });
        }
        if (!(0, authMiddleware_1.canAccessCategory)(req.user, existing.asset.assetType)) {
            return res.status(403).json({
                error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets.`
            });
        }
        const isCompleting = status === client_1.MaintenanceStatus.COMPLETED && existing.status !== client_1.MaintenanceStatus.COMPLETED;
        const isStarting = status === client_1.MaintenanceStatus.IN_PROGRESS && existing.status !== client_1.MaintenanceStatus.IN_PROGRESS;
        const updatedMaint = await prisma_1.prisma.maintenance.update({
            where: { id },
            data: {
                ...(status && { status: status }),
                ...(priority && { priority: priority }),
                ...(action && { action }),
                ...(assignedTo && { assignedTo }),
                ...(expectedCompletionDate && { expectedCompletionDate: new Date(expectedCompletionDate) }),
                ...(actualCompletionDate && { actualCompletionDate: new Date(actualCompletionDate) }),
                ...(isCompleting && !actualCompletionDate && { actualCompletionDate: new Date() }),
                ...(cost !== undefined && { cost: parseFloat(cost) }),
                ...(beforePhotoUrl && { beforePhotoUrl }),
                ...(afterPhotoUrl && { afterPhotoUrl }),
            }
        });
        const assetId = existing.assetId;
        if (isStarting) {
            await prisma_1.prisma.asset.update({
                where: { id: assetId },
                data: { status: client_1.AssetStatus.UNDER_MAINTENANCE }
            });
            await prisma_1.prisma.lifecycleEvent.create({
                data: {
                    assetId,
                    eventType: client_1.EventType.MAINTENANCE_STARTED,
                    description: `Work order started by ${updatedMaint.assignedTo}. Issue: ${updatedMaint.issue}`,
                    performedBy: updatedMaint.assignedTo
                }
            });
        }
        if (isCompleting) {
            const otherPending = await prisma_1.prisma.maintenance.findMany({
                where: {
                    assetId,
                    id: { not: id },
                    status: { in: [client_1.MaintenanceStatus.PENDING, client_1.MaintenanceStatus.ASSIGNED, client_1.MaintenanceStatus.IN_PROGRESS] }
                }
            });
            if (otherPending.length === 0) {
                await prisma_1.prisma.asset.update({
                    where: { id: assetId },
                    data: { status: client_1.AssetStatus.ACTIVE }
                });
            }
            await prisma_1.prisma.lifecycleEvent.create({
                data: {
                    assetId,
                    eventType: client_1.EventType.MAINTENANCE_COMPLETED,
                    description: `Maintenance work order completed. Final cost: ₹${(updatedMaint.cost || 0).toLocaleString('en-IN')}. Action taken: ${updatedMaint.action}`,
                    performedBy: updatedMaint.assignedTo
                }
            });
            await prisma_1.prisma.lifecycleEvent.create({
                data: {
                    assetId,
                    eventType: client_1.EventType.REPAIRED,
                    description: `Infrastructure asset repaired & restored to operational standards by ${updatedMaint.assignedTo}.`,
                    performedBy: updatedMaint.assignedTo
                }
            });
        }
        const updatedRisk = await (0, riskHelper_1.recalculateAndSaveAssetRisk)(assetId);
        res.json({
            maintenance: updatedMaint,
            latestRisk: updatedRisk
        });
    }
    catch (error) {
        console.error('Error updating maintenance:', error);
        res.status(500).json({ error: 'Failed to update work order', details: error.message });
    }
});
exports.default = router;
