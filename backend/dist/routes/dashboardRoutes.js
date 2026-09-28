"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        // 1. Asset Counts
        const totalAssets = await prisma_1.prisma.asset.count();
        const totalRoads = await prisma_1.prisma.asset.count({ where: { assetType: client_1.AssetType.ROAD } });
        const totalBridges = await prisma_1.prisma.asset.count({ where: { assetType: client_1.AssetType.BRIDGE } });
        const totalBuildings = await prisma_1.prisma.asset.count({ where: { assetType: client_1.AssetType.BUILDING } });
        // 2. Condition Counts
        const goodCondition = await prisma_1.prisma.asset.count({ where: { currentCondition: client_1.Condition.GOOD } });
        const moderateCondition = await prisma_1.prisma.asset.count({ where: { currentCondition: client_1.Condition.MODERATE } });
        const poorCondition = await prisma_1.prisma.asset.count({ where: { currentCondition: client_1.Condition.POOR } });
        const criticalCondition = await prisma_1.prisma.asset.count({ where: { currentCondition: client_1.Condition.CRITICAL } });
        // 3. Maintenance Counts
        const pendingMaintenance = await prisma_1.prisma.maintenance.count({ where: { status: client_1.MaintenanceStatus.PENDING } });
        const assignedMaintenance = await prisma_1.prisma.maintenance.count({ where: { status: client_1.MaintenanceStatus.ASSIGNED } });
        const inProgressMaintenance = await prisma_1.prisma.maintenance.count({ where: { status: client_1.MaintenanceStatus.IN_PROGRESS } });
        const completedMaintenance = await prisma_1.prisma.maintenance.count({ where: { status: client_1.MaintenanceStatus.COMPLETED } });
        const totalMaintenanceDue = pendingMaintenance + assignedMaintenance + inProgressMaintenance;
        // 4. Latest Risk Assessment counts for each active asset
        const assetsWithLatestRisk = await prisma_1.prisma.asset.findMany({
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
        // 5. Inspections due count (assets with no inspection or inspection older than 180 days)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
        const recentInspectedAssetIds = await prisma_1.prisma.inspection.findMany({
            where: { inspectionDate: { gte: sixMonthsAgo } },
            select: { assetId: true },
            distinct: ['assetId']
        });
        const recentInspectedSet = new Set(recentInspectedAssetIds.map(i => i.assetId));
        const inspectionsDue = totalAssets - recentInspectedSet.size;
        // 6. Assets Requiring Urgent Attention (High Risk / Critical Condition / Critical Maintenance)
        const priorityAssetsList = await prisma_1.prisma.asset.findMany({
            where: {
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
        // Format priority assets table
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
            totals: {
                totalAssets,
                totalRoads,
                totalBridges,
                totalBuildings,
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
