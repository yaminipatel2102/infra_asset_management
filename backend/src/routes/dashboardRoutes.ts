import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { AssetType, Condition, RiskLevel, MaintenanceStatus } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest, getUserCategoryFilter } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queryCategory = req.query.category as string;
    const userCategory = getUserCategoryFilter(req.user);

    // Effective category filter
    let effectiveCategory = 'ALL';
    if (userCategory !== 'ALL') {
      effectiveCategory = userCategory;
    } else if (queryCategory && ['ROAD', 'BRIDGE', 'BUILDING'].includes(queryCategory)) {
      effectiveCategory = queryCategory;
    }

    const assetWhere: any = {};
    if (effectiveCategory !== 'ALL') {
      assetWhere.assetType = effectiveCategory as AssetType;
    }

    // 1. Asset Counts
    const totalAssets = await prisma.asset.count({ where: assetWhere });
    const totalRoads = await prisma.asset.count({ where: { assetType: AssetType.ROAD } });
    const totalBridges = await prisma.asset.count({ where: { assetType: AssetType.BRIDGE } });
    const totalBuildings = await prisma.asset.count({ where: { assetType: AssetType.BUILDING } });

    // 2. Condition Counts (filtered by effective category)
    const goodCondition = await prisma.asset.count({ where: { ...assetWhere, currentCondition: Condition.GOOD } });
    const moderateCondition = await prisma.asset.count({ where: { ...assetWhere, currentCondition: Condition.MODERATE } });
    const poorCondition = await prisma.asset.count({ where: { ...assetWhere, currentCondition: Condition.POOR } });
    const criticalCondition = await prisma.asset.count({ where: { ...assetWhere, currentCondition: Condition.CRITICAL } });

    // 3. Maintenance Counts (filtered by effective category)
    const maintWhere: any = {};
    if (effectiveCategory !== 'ALL') {
      maintWhere.asset = { assetType: effectiveCategory as AssetType };
    }

    const pendingMaintenance = await prisma.maintenance.count({ where: { ...maintWhere, status: MaintenanceStatus.PENDING } });
    const assignedMaintenance = await prisma.maintenance.count({ where: { ...maintWhere, status: MaintenanceStatus.ASSIGNED } });
    const inProgressMaintenance = await prisma.maintenance.count({ where: { ...maintWhere, status: MaintenanceStatus.IN_PROGRESS } });
    const completedMaintenance = await prisma.maintenance.count({ where: { ...maintWhere, status: MaintenanceStatus.COMPLETED } });
    const totalMaintenanceDue = pendingMaintenance + assignedMaintenance + inProgressMaintenance;

    // 4. Latest Risk Assessment counts
    const assetsWithLatestRisk = await prisma.asset.findMany({
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
      const level = a.riskAssessments[0]?.riskLevel || RiskLevel.LOW;
      if (level === RiskLevel.LOW) lowRisk++;
      if (level === RiskLevel.MEDIUM) mediumRisk++;
      if (level === RiskLevel.HIGH) highRisk++;
      if (level === RiskLevel.CRITICAL) criticalRisk++;
    });

    // 5. Category-Specific Quick Cards (for Global R&B Dashboard)
    const getCategoryCardStats = async (type: AssetType) => {
      const total = await prisma.asset.count({ where: { assetType: type } });
      const critical = await prisma.asset.count({ where: { assetType: type, currentCondition: Condition.CRITICAL } });

      const catAssets = await prisma.asset.findMany({
        where: { assetType: type },
        select: {
          riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
        }
      });
      const highRiskCount = catAssets.filter(a => {
        const lvl = a.riskAssessments[0]?.riskLevel;
        return lvl === RiskLevel.HIGH || lvl === RiskLevel.CRITICAL;
      }).length;

      const maintDue = await prisma.maintenance.count({
        where: {
          asset: { assetType: type },
          status: { in: [MaintenanceStatus.PENDING, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS] }
        }
      });

      return { total, critical, highRisk: highRiskCount, maintenanceDue: maintDue };
    };

    const roadsCard = await getCategoryCardStats(AssetType.ROAD);
    const bridgesCard = await getCategoryCardStats(AssetType.BRIDGE);
    const buildingsCard = await getCategoryCardStats(AssetType.BUILDING);

    // 6. Inspections due count
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const recentInspectedAssetIds = await prisma.inspection.findMany({
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
    const priorityAssetsList = await prisma.asset.findMany({
      where: {
        ...assetWhere,
        OR: [
          { currentCondition: Condition.CRITICAL },
          { currentCondition: Condition.POOR },
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
      if (a.currentCondition === Condition.CRITICAL) {
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
        riskLevel: risk?.riskLevel || RiskLevel.MEDIUM,
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
  } catch (error: any) {
    console.error('Error computing dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

export default router;
