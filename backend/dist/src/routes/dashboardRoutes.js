"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const queryCategory = req.query.category;
        const userCategory = (0, authMiddleware_1.getUserCategoryFilter)(req.user);
        // Effective category filter
        let effectiveCategory = 'ALL';
        if (userCategory !== 'ALL') {
            effectiveCategory = userCategory;
        }
        else if (queryCategory && ['ROAD', 'BRIDGE', 'BUILDING'].includes(queryCategory)) {
            effectiveCategory = queryCategory;
        }
        const assetWhere = {};
        if (effectiveCategory !== 'ALL') {
            assetWhere.assetType = effectiveCategory;
        }
        // 1. Asset Counts
        const totalAssets = await prisma_1.prisma.asset.count({ where: assetWhere });
        const totalRoads = await prisma_1.prisma.asset.count({ where: { assetType: client_1.AssetType.ROAD } });
        const totalBridges = await prisma_1.prisma.asset.count({ where: { assetType: client_1.AssetType.BRIDGE } });
        const totalBuildings = await prisma_1.prisma.asset.count({ where: { assetType: client_1.AssetType.BUILDING } });
        // 2. Condition Counts (filtered by effective category)
        const goodCondition = await prisma_1.prisma.asset.count({ where: { ...assetWhere, currentCondition: client_1.Condition.GOOD } });
        const moderateCondition = await prisma_1.prisma.asset.count({ where: { ...assetWhere, currentCondition: client_1.Condition.MODERATE } });
        const poorCondition = await prisma_1.prisma.asset.count({ where: { ...assetWhere, currentCondition: client_1.Condition.POOR } });
        const criticalCondition = await prisma_1.prisma.asset.count({ where: { ...assetWhere, currentCondition: client_1.Condition.CRITICAL } });
        // 3. Maintenance Counts (filtered by effective category)
        const maintWhere = {};
        if (effectiveCategory !== 'ALL') {
            maintWhere.asset = { assetType: effectiveCategory };
        }
        const pendingMaintenance = await prisma_1.prisma.maintenance.count({ where: { ...maintWhere, status: client_1.MaintenanceStatus.PENDING } });
        const assignedMaintenance = await prisma_1.prisma.maintenance.count({ where: { ...maintWhere, status: client_1.MaintenanceStatus.ASSIGNED } });
        const inProgressMaintenance = await prisma_1.prisma.maintenance.count({ where: { ...maintWhere, status: client_1.MaintenanceStatus.IN_PROGRESS } });
        const completedMaintenance = await prisma_1.prisma.maintenance.count({ where: { ...maintWhere, status: client_1.MaintenanceStatus.COMPLETED } });
        const totalMaintenanceDue = pendingMaintenance + assignedMaintenance + inProgressMaintenance;
        // 4. Latest Risk Assessment counts
        const assetsWithLatestRisk = await prisma_1.prisma.asset.findMany({
            where: assetWhere,
            select: {
                id: true,
                currentCondition: true,
                riskAssessments: {
                    orderBy: { assessedAt: 'desc' },
                    take: 1
                }
            }
        });
        let lowRisk = 0;
        let mediumRisk = 0;
        let highRisk = 0;
        let criticalRisk = 0;
        assetsWithLatestRisk.forEach(a => {
            const level = a.riskAssessments[0]?.riskLevel || client_1.RiskLevel.LOW;
            if (level === client_1.RiskLevel.LOW)
                lowRisk++;
            if (level === client_1.RiskLevel.MEDIUM)
                mediumRisk++;
            if (level === client_1.RiskLevel.HIGH)
                highRisk++;
            if (level === client_1.RiskLevel.CRITICAL)
                criticalRisk++;
        });
        // 5. Category-Specific Quick Cards (for Global R&B Dashboard)
        const getCategoryCardStats = async (type) => {
            const total = await prisma_1.prisma.asset.count({ where: { assetType: type } });
            const critical = await prisma_1.prisma.asset.count({ where: { assetType: type, currentCondition: client_1.Condition.CRITICAL } });
            const catAssets = await prisma_1.prisma.asset.findMany({
                where: { assetType: type },
                select: {
                    riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
                }
            });
            const highRiskCount = catAssets.filter(a => {
                const lvl = a.riskAssessments[0]?.riskLevel;
                return lvl === client_1.RiskLevel.HIGH || lvl === client_1.RiskLevel.CRITICAL;
            }).length;
            const maintDue = await prisma_1.prisma.maintenance.count({
                where: {
                    asset: { assetType: type },
                    status: { in: [client_1.MaintenanceStatus.PENDING, client_1.MaintenanceStatus.ASSIGNED, client_1.MaintenanceStatus.IN_PROGRESS] }
                }
            });
            return { total, critical, highRisk: highRiskCount, maintenanceDue: maintDue };
        };
        const roadsCard = await getCategoryCardStats(client_1.AssetType.ROAD);
        const bridgesCard = await getCategoryCardStats(client_1.AssetType.BRIDGE);
        const buildingsCard = await getCategoryCardStats(client_1.AssetType.BUILDING);
        // 6. Inspections due count
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
        const recentInspectedAssetIds = await prisma_1.prisma.inspection.findMany({
            where: {
                inspectionDate: { gte: sixMonthsAgo },
                asset: assetWhere
            },
            select: { assetId: true },
            distinct: ['assetId']
        });
        const recentInspectedSet = new Set(recentInspectedAssetIds.map(i => i.assetId));
        const inspectionsDue = totalAssets - recentInspectedSet.size;
        // 7. Assets Requiring Urgent Attention (Filtered)
        const priorityAssetsList = await prisma_1.prisma.asset.findMany({
            where: {
                ...assetWhere,
                OR: [
                    { currentCondition: client_1.Condition.CRITICAL },
                    { currentCondition: client_1.Condition.POOR },
                ]
            },
            include: {
                riskAssessments: {
                    orderBy: { assessedAt: 'desc' },
                    take: 1
                },
                maintenances: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1
                }
            },
            take: 10
        });
        const assetsRequiringAttention = priorityAssetsList.map(a => {
            const risk = a.riskAssessments[0];
            const maint = a.maintenances[0];
            const insp = a.inspections[0];
            let recommendedAction = insp?.recommendedAction || 'Schedule structural safety inspection and plan repair.';
            if (a.currentCondition === client_1.Condition.CRITICAL) {
                recommendedAction = 'IMMEDIATE ACTION: Evacuate / Restrict traffic and execute urgent structural overhaul.';
            }
            return {
                id: a.id,
                assetCode: a.assetCode,
                name: a.name,
                assetType: a.assetType,
                district: a.district,
                currentCondition: a.currentCondition,
                riskScore: risk?.totalRiskScore || 50,
                riskLevel: risk?.riskLevel || client_1.RiskLevel.MEDIUM,
                maintenanceStatus: maint ? maint.status : 'NO_MAINTENANCE',
                recommendedAction
            };
        }).sort((a, b) => b.riskScore - a.riskScore);
        res.json({
            categoryFilter: effectiveCategory,
            totals: {
                totalAssets,
                totalRoads,
                totalBridges,
                totalBuildings,
            },
            categoryCards: {
                roads: roadsCard,
                bridges: bridgesCard,
                buildings: buildingsCard,
            },
            conditionDistribution: {
                good: goodCondition,
                moderate: moderateCondition,
                poor: poorCondition,
                critical: criticalCondition,
            },
            riskDistribution: {
                low: lowRisk,
                medium: mediumRisk,
                high: highRisk,
                critical: criticalRisk,
            },
            maintenanceStatusDistribution: {
                pending: pendingMaintenance,
                assigned: assignedMaintenance,
                inProgress: inProgressMaintenance,
                completed: completedMaintenance,
            },
            dues: {
                inspectionsDue,
                maintenanceDue: totalMaintenanceDue,
            },
            assetsRequiringAttention
        });
    }
    catch (error) {
        console.error('Error computing dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
    }
});
exports.default = router;
