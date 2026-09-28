import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { Condition, EventType, AssetType } from '@prisma/client';
import { recalculateAndSaveAssetRisk } from '../utils/riskHelper';
import { authenticateToken, AuthenticatedRequest, getUserCategoryFilter, canAccessCategory } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/inspections - Filtered by role category
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userCat = getUserCategoryFilter(req.user);

    const where: any = {};
    if (userCat !== 'ALL') {
      where.asset = { assetType: userCat as AssetType };
    }

    const inspections = await prisma.inspection.findMany({
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
  } catch (error: any) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ error: 'Failed to fetch inspections', details: error.message });
  }
});

// GET /api/assets/:assetId/inspections
router.get('/asset/:assetId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assetId } = req.params;
    const inspections = await prisma.inspection.findMany({
      where: { assetId },
      orderBy: { inspectionDate: 'desc' }
    });
    res.json(inspections);
  } catch (error: any) {
    console.error('Error fetching asset inspections:', error);
    res.status(500).json({ error: 'Failed to fetch asset inspections', details: error.message });
  }
});

// POST /api/inspections - Create inspection
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      assetId,
      inspectionDate,
      inspectorName,
      condition,
      observations,
      recommendedAction,
      photoUrl
    } = req.body;

    if (!assetId || !inspectorName || !condition) {
      return res.status(400).json({ error: 'Missing required inspection fields (assetId, inspectorName, condition)' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Target asset not found' });
    }

    // Role category authorization check
    if (!canAccessCategory(req.user, asset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot inspect a ${asset.assetType}.`
      });
    }

    const inspDate = inspectionDate ? new Date(inspectionDate) : new Date();

    const newInspection = await prisma.inspection.create({
      data: {
        assetId,
        inspectionDate: inspDate,
        inspectorName,
        condition: condition as Condition,
        observations: observations || 'Routine site audit conducted.',
        recommendedAction: recommendedAction || 'Continue routine inspection.',
        photoUrl: photoUrl || null
      }
    });

    const oldCondition = asset.currentCondition;
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: { currentCondition: condition as Condition }
    });

    await prisma.lifecycleEvent.create({
      data: {
        assetId,
        eventType: EventType.INSPECTED,
        eventDate: inspDate,
        description: `Field inspection completed by ${inspectorName}. Condition assessed as ${condition}. Observations: ${observations || 'N/A'}`,
        performedBy: inspectorName
      }
    });

    if (oldCondition !== condition) {
      await prisma.lifecycleEvent.create({
        data: {
          assetId,
          eventType: EventType.CONDITION_UPDATED,
          eventDate: inspDate,
          description: `Asset condition revised from ${oldCondition} to ${condition} based on inspection report.`,
          performedBy: inspectorName
        }
      });
    }

    const updatedRisk = await recalculateAndSaveAssetRisk(assetId);

    res.status(201).json({
      inspection: newInspection,
      assetCondition: updatedAsset.currentCondition,
      latestRisk: updatedRisk
    });
  } catch (error: any) {
    console.error('Error creating inspection:', error);
    res.status(500).json({ error: 'Failed to record inspection', details: error.message });
  }
});

export default router;
