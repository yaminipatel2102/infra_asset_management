"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const riskHelper_1 = require("../utils/riskHelper");
const router = (0, express_1.Router)();
// GET /api/assets - Search, Filter, Sort
router.get('/', async (req, res) => {
    try {
        const { search, assetType, district, condition, riskLevel, status, maintenanceStatus, sortBy = 'createdAt', order = 'desc' } = req.query;
        const where = {};
        if (search && typeof search === 'string' && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { assetCode: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
                { district: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (assetType && typeof assetType === 'string' && assetType !== 'ALL') {
            where.assetType = assetType;
        }
        if (district && typeof district === 'string' && district !== 'ALL') {
            where.district = { contains: district, mode: 'insensitive' };
        }
        if (condition && typeof condition === 'string' && condition !== 'ALL') {
            where.currentCondition = condition;
        }
        if (status && typeof status === 'string' && status !== 'ALL') {
            where.status = status;
        }
        const assets = await prisma_1.prisma.asset.findMany({
            where,
            include: {
                roadDetails: true,
                bridgeDetails: true,
                buildingDetails: true,
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1
                },
                maintenances: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                riskAssessments: {
                    orderBy: { assessedAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                [sortBy]: order === 'asc' ? 'asc' : 'desc'
            }
        });
        // Post-filter for riskLevel or maintenanceStatus if requested
        let result = assets.map((a) => {
            const latestRisk = a.riskAssessments[0] || null;
            const latestInspection = a.inspections[0] || null;
            const latestMaintenance = a.maintenances[0] || null;
            return {
                ...a,
                latestRisk,
                latestInspection,
                latestMaintenance
            };
        });
        if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
            result = result.filter(a => a.latestRisk?.riskLevel === riskLevel);
        }
        if (maintenanceStatus && typeof maintenanceStatus === 'string' && maintenanceStatus !== 'ALL') {
            result = result.filter(a => a.latestMaintenance?.status === maintenanceStatus);
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to fetch assets', details: error.message });
    }
});
// GET /api/assets/:id - Digital Asset Passport full details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await prisma_1.prisma.asset.findFirst({
            where: {
                OR: [{ id }, { assetCode: id }]
            },
            include: {
                roadDetails: true,
                bridgeDetails: true,
                buildingDetails: true,
                inspections: {
                    orderBy: { inspectionDate: 'desc' }
                },
                maintenances: {
                    orderBy: { createdAt: 'desc' }
                },
                lifecycleEvents: {
                    orderBy: { eventDate: 'desc' }
                },
                riskAssessments: {
                    orderBy: { assessedAt: 'desc' }
                }
            }
        });
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        const latestRisk = asset.riskAssessments[0] || null;
        const latestInspection = asset.inspections[0] || null;
        const latestMaintenance = asset.maintenances[0] || null;
        // Calculate age
        const currentYear = new Date().getFullYear();
        const constrYear = new Date(asset.constructionDate).getFullYear();
        const age = Math.max(0, currentYear - constrYear);
        // Total maintenance cost
        const totalMaintenanceCost = asset.maintenances.reduce((acc, curr) => acc + (curr.cost || 0), 0);
        // Recommended action helper
        let recommendedAction = 'Routine monitoring and annual structural audit.';
        if (asset.currentCondition === client_1.Condition.CRITICAL) {
            recommendedAction = 'IMMEDIATE ACTION REQUIRED: Urgent structural repair & traffic / occupancy safety advisory.';
        }
        else if (asset.currentCondition === client_1.Condition.POOR) {
            recommendedAction = 'Priority maintenance required within 30 days to prevent further structural degradation.';
        }
        else if (asset.currentCondition === client_1.Condition.MODERATE) {
            recommendedAction = 'Schedule preventative maintenance and micro-repair within 90 days.';
        }
        if (latestInspection?.recommendedAction) {
            recommendedAction = latestInspection.recommendedAction;
        }
        res.json({
            ...asset,
            age,
            latestRisk,
            latestInspection,
            latestMaintenance,
            totalMaintenanceCost,
            recommendedAction
        });
    }
    catch (error) {
        console.error('Error fetching asset details:', error);
        res.status(500).json({ error: 'Failed to fetch asset passport', details: error.message });
    }
});
// POST /api/assets - Add New Asset
router.post('/', async (req, res) => {
    try {
        const { assetCode, name, assetType, district, location, latitude, longitude, constructionDate, currentCondition = client_1.Condition.GOOD, criticality = client_1.Criticality.MEDIUM, responsibleDivision, status = client_1.AssetStatus.ACTIVE, 
        // Road specific
        roadLength, roadCategory, surfaceType, 
        // Bridge specific
        bridgeLength, bridgeType, numberOfLanes, 
        // Building specific
        buildingType, numberOfFloors, builtUpArea } = req.body;
        if (!name || !assetType || !district || !location) {
            return res.status(400).json({ error: 'Missing required asset fields (name, assetType, district, location)' });
        }
        // Generate asset code if not provided
        const code = assetCode || `${assetType.substring(0, 3)}-${district.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const constrDate = constructionDate ? new Date(constructionDate) : new Date();
        const createdAsset = await prisma_1.prisma.asset.create({
            data: {
                assetCode: code,
                name,
                assetType,
                district,
                location,
                latitude: parseFloat(latitude) || 23.0225,
                longitude: parseFloat(longitude) || 72.5714,
                constructionDate: constrDate,
                currentCondition,
                criticality,
                responsibleDivision: responsibleDivision || `${district} R&B Division`,
                status
            }
        });
        // Create sub-type details
        if (assetType === client_1.AssetType.ROAD) {
            await prisma_1.prisma.roadDetails.create({
                data: {
                    assetId: createdAsset.id,
                    roadLength: parseFloat(roadLength) || 10.0,
                    roadCategory: roadCategory || 'State Highway',
                    surfaceType: surfaceType || 'Asphalt'
                }
            });
        }
        else if (assetType === client_1.AssetType.BRIDGE) {
            await prisma_1.prisma.bridgeDetails.create({
                data: {
                    assetId: createdAsset.id,
                    bridgeLength: parseFloat(bridgeLength) || 150.0,
                    bridgeType: bridgeType || 'RCC Girder',
                    numberOfLanes: parseInt(numberOfLanes) || 4
                }
            });
        }
        else if (assetType === client_1.AssetType.BUILDING) {
            await prisma_1.prisma.buildingDetails.create({
                data: {
                    assetId: createdAsset.id,
                    buildingType: buildingType || 'Administrative Office',
                    numberOfFloors: parseInt(numberOfFloors) || 4,
                    builtUpArea: parseFloat(builtUpArea) || 5000.0
                }
            });
        }
        // Create Lifecycle Events
        await prisma_1.prisma.lifecycleEvent.create({
            data: {
                assetId: createdAsset.id,
                eventType: client_1.EventType.CONSTRUCTED,
                eventDate: constrDate,
                description: `Infrastructure asset constructed at ${location}, ${district}.`,
                performedBy: responsibleDivision || 'R&B Department'
            }
        });
        await prisma_1.prisma.lifecycleEvent.create({
            data: {
                assetId: createdAsset.id,
                eventType: client_1.EventType.REGISTERED,
                eventDate: new Date(),
                description: `Digital Asset Passport created. Asset Code: ${code}. Initial Condition: ${currentCondition}.`,
                performedBy: 'System Admin'
            }
        });
        // Calculate Initial Risk Assessment
        await (0, riskHelper_1.recalculateAndSaveAssetRisk)(createdAsset.id);
        // Return created full asset
        const fullAsset = await prisma_1.prisma.asset.findUnique({
            where: { id: createdAsset.id },
            include: {
                roadDetails: true,
                bridgeDetails: true,
                buildingDetails: true,
                riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
            }
        });
        res.status(201).json(fullAsset);
    }
    catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({ error: 'Failed to create asset', details: error.message });
    }
});
// PUT /api/assets/:id - Update Asset
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, district, location, latitude, longitude, currentCondition, criticality, responsibleDivision, status, 
        // Road
        roadLength, roadCategory, surfaceType, 
        // Bridge
        bridgeLength, bridgeType, numberOfLanes, 
        // Building
        buildingType, numberOfFloors, builtUpArea } = req.body;
        const existingAsset = await prisma_1.prisma.asset.findUnique({ where: { id } });
        if (!existingAsset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        const updatedAsset = await prisma_1.prisma.asset.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(district && { district }),
                ...(location && { location }),
                ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
                ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
                ...(currentCondition && { currentCondition }),
                ...(criticality && { criticality }),
                ...(responsibleDivision && { responsibleDivision }),
                ...(status && { status }),
            }
        });
        // Update subtype details
        if (existingAsset.assetType === client_1.AssetType.ROAD) {
            await prisma_1.prisma.roadDetails.upsert({
                where: { assetId: id },
                update: {
                    ...(roadLength !== undefined && { roadLength: parseFloat(roadLength) }),
                    ...(roadCategory && { roadCategory }),
                    ...(surfaceType && { surfaceType })
                },
                create: {
                    assetId: id,
                    roadLength: parseFloat(roadLength) || 10,
                    roadCategory: roadCategory || 'State Highway',
                    surfaceType: surfaceType || 'Asphalt'
                }
            });
        }
        else if (existingAsset.assetType === client_1.AssetType.BRIDGE) {
            await prisma_1.prisma.bridgeDetails.upsert({
                where: { assetId: id },
                update: {
                    ...(bridgeLength !== undefined && { bridgeLength: parseFloat(bridgeLength) }),
                    ...(bridgeType && { bridgeType }),
                    ...(numberOfLanes !== undefined && { numberOfLanes: parseInt(numberOfLanes) })
                },
                create: {
                    assetId: id,
                    bridgeLength: parseFloat(bridgeLength) || 100,
                    bridgeType: bridgeType || 'RCC Girder',
                    numberOfLanes: parseInt(numberOfLanes) || 4
                }
            });
        }
        else if (existingAsset.assetType === client_1.AssetType.BUILDING) {
            await prisma_1.prisma.buildingDetails.upsert({
                where: { assetId: id },
                update: {
                    ...(buildingType && { buildingType }),
                    ...(numberOfFloors !== undefined && { numberOfFloors: parseInt(numberOfFloors) }),
                    ...(builtUpArea !== undefined && { builtUpArea: parseFloat(builtUpArea) })
                },
                create: {
                    assetId: id,
                    buildingType: buildingType || 'Administrative',
                    numberOfFloors: parseInt(numberOfFloors) || 4,
                    builtUpArea: parseFloat(builtUpArea) || 5000
                }
            });
        }
        // Log lifecycle event if condition or status changed
        if (currentCondition && currentCondition !== existingAsset.currentCondition) {
            await prisma_1.prisma.lifecycleEvent.create({
                data: {
                    assetId: id,
                    eventType: client_1.EventType.CONDITION_UPDATED,
                    description: `Asset condition updated from ${existingAsset.currentCondition} to ${currentCondition}.`,
                    performedBy: responsibleDivision || 'Asset Manager'
                }
            });
        }
        if (status && status !== existingAsset.status) {
            await prisma_1.prisma.lifecycleEvent.create({
                data: {
                    assetId: id,
                    eventType: client_1.EventType.STATUS_CHANGED,
                    description: `Asset status changed from ${existingAsset.status} to ${status}.`,
                    performedBy: responsibleDivision || 'Asset Manager'
                }
            });
        }
        // Recalculate Risk
        await (0, riskHelper_1.recalculateAndSaveAssetRisk)(id);
        const fullUpdated = await prisma_1.prisma.asset.findUnique({
            where: { id },
            include: {
                roadDetails: true,
                bridgeDetails: true,
                buildingDetails: true,
                riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
            }
        });
        res.json(fullUpdated);
    }
    catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).json({ error: 'Failed to update asset', details: error.message });
    }
});
// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.asset.delete({ where: { id } });
        res.json({ message: 'Asset deleted successfully', id });
    }
    catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).json({ error: 'Failed to delete asset', details: error.message });
    }
});
// GET /api/assets/:id/lifecycle
router.get('/:id/lifecycle', async (req, res) => {
    try {
        const { id } = req.params;
        const events = await prisma_1.prisma.lifecycleEvent.findMany({
            where: { assetId: id },
            orderBy: { eventDate: 'desc' }
        });
        res.json(events);
    }
    catch (error) {
        console.error('Error fetching lifecycle:', error);
        res.status(500).json({ error: 'Failed to fetch lifecycle events', details: error.message });
    }
});
// GET /api/assets/:id/risk
router.get('/:id/risk', async (req, res) => {
    try {
        const { id } = req.params;
        const risk = await prisma_1.prisma.riskAssessment.findFirst({
            where: { assetId: id },
            orderBy: { assessedAt: 'desc' }
        });
        res.json(risk);
    }
    catch (error) {
        console.error('Error fetching risk assessment:', error);
        res.status(500).json({ error: 'Failed to fetch risk assessment', details: error.message });
    }
});
exports.default = router;
