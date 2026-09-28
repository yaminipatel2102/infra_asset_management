import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { AssetType } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest, getUserCategoryFilter } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/reports/summary - Aggregate metrics for Reports page
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userCat = getUserCategoryFilter(req.user);

    const where: any = {};
    if (userCat !== 'ALL') {
      where.assetType = userCat as AssetType;
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 },
        maintenances: true,
        inspections: true
      }
    });

    const districtStats: Record<string, { total: number; roads: number; bridges: number; buildings: number; critical: number }> = {};

    assets.forEach(a => {
      const d = a.district;
      if (!districtStats[d]) {
        districtStats[d] = { total: 0, roads: 0, bridges: 0, buildings: 0, critical: 0 };
      }
      districtStats[d].total += 1;
      if (a.assetType === 'ROAD') districtStats[d].roads += 1;
      if (a.assetType === 'BRIDGE') districtStats[d].bridges += 1;
      if (a.assetType === 'BUILDING') districtStats[d].buildings += 1;
      if (a.currentCondition === 'CRITICAL' || a.currentCondition === 'POOR') districtStats[d].critical += 1;
    });

    const districtList = Object.keys(districtStats).map(d => ({
      district: d,
      ...districtStats[d]
    }));

    res.json({
      districtBreakdown: districtList,
      totalAssetsCount: assets.length
    });
  } catch (error: any) {
    console.error('Error fetching report summary:', error);
    res.status(500).json({ error: 'Failed to fetch report summary', details: error.message });
  }
});

// GET /api/reports/export-csv - CSV Export (Filtered by role)
router.get('/export-csv', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userCat = getUserCategoryFilter(req.user);

    const where: any = {};
    if (userCat !== 'ALL') {
      where.assetType = userCat as AssetType;
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        roadDetails: true,
        bridgeDetails: true,
        buildingDetails: true,
        riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 },
        inspections: { orderBy: { inspectionDate: 'desc' }, take: 1 },
        maintenances: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const headers = [
      'Asset Code',
      'Name',
      'Type',
      'District',
      'Location',
      'Construction Date',
      'Condition',
      'Criticality',
      'Responsible Division',
      'Status',
      'Risk Score',
      'Risk Level',
      'Last Inspection Date',
      'Latest Maintenance Status'
    ];

    const rows = assets.map(a => {
      const risk = a.riskAssessments[0];
      const insp = a.inspections[0];
      const maint = a.maintenances[0];

      return [
        `"${a.assetCode}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.assetType}"`,
        `"${a.district}"`,
        `"${a.location.replace(/"/g, '""')}"`,
        `"${new Date(a.constructionDate).toISOString().split('T')[0]}"`,
        `"${a.currentCondition}"`,
        `"${a.criticality}"`,
        `"${a.responsibleDivision}"`,
        `"${a.status}"`,
        `"${risk ? risk.totalRiskScore : 'N/A'}"`,
        `"${risk ? risk.riskLevel : 'N/A'}"`,
        `"${insp ? new Date(insp.inspectionDate).toISOString().split('T')[0] : 'N/A'}"`,
        `"${maint ? maint.status : 'NO_MAINTENANCE'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="RB_Asset_Report_${userCat}.csv"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV', details: error.message });
  }
});

export default router;
