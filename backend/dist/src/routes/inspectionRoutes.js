"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const riskHelper_1 = require("../utils/riskHelper");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
// GET /api/inspections - Filtered by role category
router.get('/', async (req, res) => {
    try {
        const userCat = (0, authMiddleware_1.getUserCategoryFilter)(req.user);
        const where = {};
        if (userCat !== 'ALL') {
            where.asset = { assetType: userCat };
        }
        const inspections = await prisma_1.prisma.inspection.findMany({
            where,
            include: {
                asset: {
                    select: {
                        id: true,
                        assetCode: true,
                        name: true,
                        assetType: true,
                        district: true,
                        currentCondition: true
                    }
                }
            },
            orderBy: { inspectionDate: 'desc' }
        });
        res.json(inspections);
    }
    catch (error) {
        console.error('Error fetching inspections:', error);
        res.status(500).json({ error: 'Failed to fetch inspections', details: error.message });
    }
});
// GET /api/assets/:assetId/inspections
router.get('/asset/:assetId', async (req, res) => {
    try {
        const { assetId } = req.params;
        const inspections = await prisma_1.prisma.inspection.findMany({
            where: { assetId },
            orderBy: { inspectionDate: 'desc' }
        });
        res.json(inspections);
    }
    catch (error) {
        console.error('Error fetching asset inspections:', error);
        res.status(500).json({ error: 'Failed to fetch asset inspections', details: error.message });
    }
});
// POST /api/inspections - Create inspection
router.post('/', async (req, res) => {
    try {
        const { assetId, inspectionDate, inspectorName, condition, observations, recommendedAction, photoUrl } = req.body;
        if (!assetId || !inspectorName || !condition) {
            return res.status(400).json({ error: 'Missing required inspection fields (assetId, inspectorName, condition)' });
        }
        const asset = await prisma_1.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) {
            return res.status(404).json({ error: 'Target asset not found' });
        }
        // Role category authorization check
        if (!(0, authMiddleware_1.canAccessCategory)(req.user, asset.assetType)) {
            return res.status(403).json({
                error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot inspect a ${asset.assetType}.`
            });
        }
        const inspDate = inspectionDate ? new Date(inspectionDate) : new Date();
        const newInspection = await prisma_1.prisma.inspection.create({
            data: {
                assetId,
                inspectionDate: inspDate,
                inspectorName,
                condition: condition,
                observations: observations || 'Routine site audit conducted.',
                recommendedAction: recommendedAction || 'Continue routine inspection.',
                photoUrl: photoUrl || null
            }
        });
        const oldCondition = asset.currentCondition;
        const updatedAsset = await prisma_1.prisma.asset.update({
            where: { id: assetId },
            data: { currentCondition: condition }
        });
        await prisma_1.prisma.lifecycleEvent.create({
            data: {
                assetId,
                eventType: client_1.EventType.INSPECTED,
                eventDate: inspDate,
                description: `Field inspection completed by ${inspectorName}. Condition assessed as ${condition}. Observations: ${observations || 'N/A'}`,
                performedBy: inspectorName
            }
        });
        if (oldCondition !== condition) {
            await prisma_1.prisma.lifecycleEvent.create({
                data: {
                    assetId,
                    eventType: client_1.EventType.CONDITION_UPDATED,
                    eventDate: inspDate,
                    description: `Asset condition revised from ${oldCondition} to ${condition} based on inspection report.`,
                    performedBy: inspectorName
                }
            });
        }
        const updatedRisk = await (0, riskHelper_1.recalculateAndSaveAssetRisk)(assetId);
        res.status(201).json({
            inspection: newInspection,
            assetCondition: updatedAsset.currentCondition,
            latestRisk: updatedRisk
        });
    }
    catch (error) {
        console.error('Error creating inspection:', error);
        res.status(500).json({ error: 'Failed to record inspection', details: error.message });
    }
});
exports.default = router;
