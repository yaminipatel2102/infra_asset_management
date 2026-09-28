import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { AssetType, Condition, Criticality, AssetStatus, EventType } from '@prisma/client';
import { recalculateAndSaveAssetRisk } from '../utils/riskHelper';
import { authenticateToken, AuthenticatedRequest, getUserCategoryFilter, canAccessCategory, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/assets - Search, Filter, Sort with Strict Category Role Isolation
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, assetType, district, condition, riskLevel, status, maintenanceStatus, sortBy = 'createdAt', order = 'desc' } = req.query;

    const userCat = getUserCategoryFilter(req.user);

    const where: any = {};

    // Force strict database-level filtering based on user role
    if (userCat !== 'ALL') {
      where.assetType = userCat as AssetType;
    } else if (assetType && typeof assetType === 'string' && assetType !== 'ALL') {
      where.assetType = assetType as AssetType;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { assetCode: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (district && typeof district === 'string' && district !== 'ALL') {
      where.district = { contains: district, mode: 'insensitive' };
    }

    if (condition && typeof condition === 'string' && condition !== 'ALL') {
      where.currentCondition = condition as Condition;
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as AssetStatus;
    }

    const assets = await prisma.asset.findMany({
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
        [sortBy as string]: order === 'asc' ? 'asc' : 'desc'
      }
    });

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
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets', details: error.message });
  }
});

// GET /api/assets/:id - Digital Asset Passport
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findFirst({
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

    // Role category authorization check
    if (!canAccessCategory(req.user, asset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets only.`
      });
    }

    const latestRisk = asset.riskAssessments[0] || null;
    const latestInspection = asset.inspections[0] || null;
    const latestMaintenance = asset.maintenances[0] || null;

    const currentYear = new Date().getFullYear();
    const constrYear = new Date(asset.constructionDate).getFullYear();
    const age = Math.max(0, currentYear - constrYear);

    const totalMaintenanceCost = asset.maintenances.reduce((acc, curr) => acc + (curr.cost || 0), 0);

    let recommendedAction = 'Routine monitoring and annual structural audit.';
    if (asset.currentCondition === Condition.CRITICAL) {
      recommendedAction = 'IMMEDIATE ACTION REQUIRED: Urgent structural repair & traffic / occupancy safety advisory.';
    } else if (asset.currentCondition === Condition.POOR) {
      recommendedAction = 'Priority maintenance required within 30 days to prevent further structural degradation.';
    } else if (asset.currentCondition === Condition.MODERATE) {
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
  } catch (error: any) {
    console.error('Error fetching asset details:', error);
    res.status(500).json({ error: 'Failed to fetch asset passport', details: error.message });
  }
});

// POST /api/assets - Add New Asset
router.post('/', requirePermission('ASSET_CREATE'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      assetCode,
      name,
      assetType,
      district,
      location,
      latitude,
      longitude,
      constructionDate,
      currentCondition = Condition.GOOD,
      criticality = Criticality.MEDIUM,
      responsibleDivision,
      status = AssetStatus.ACTIVE,
      roadLength,
      roadCategory,
      surfaceType,
      bridgeLength,
      bridgeType,
      numberOfLanes,
      buildingType,
      numberOfFloors,
      builtUpArea
    } = req.body;

    if (!name || !assetType || !district || !location) {
      return res.status(400).json({ error: 'Missing required asset fields (name, assetType, district, location)' });
    }

    // Role authorization check
    if (!canAccessCategory(req.user, assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot register a ${assetType}.`
      });
    }

    const code = assetCode || `${assetType.substring(0, 3)}-${district.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const constrDate = constructionDate ? new Date(constructionDate) : new Date();

    const createdAsset = await prisma.asset.create({
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

    if (assetType === AssetType.ROAD) {
      await prisma.roadDetails.create({
        data: {
          assetId: createdAsset.id,
          roadLength: parseFloat(roadLength) || 10.0,
          roadCategory: roadCategory || 'State Highway',
          surfaceType: surfaceType || 'Asphalt'
        }
      });
    } else if (assetType === AssetType.BRIDGE) {
      await prisma.bridgeDetails.create({
        data: {
          assetId: createdAsset.id,
          bridgeLength: parseFloat(bridgeLength) || 150.0,
          bridgeType: bridgeType || 'RCC Girder',
          numberOfLanes: parseInt(numberOfLanes) || 4
        }
      });
    } else if (assetType === AssetType.BUILDING) {
      await prisma.buildingDetails.create({
        data: {
          assetId: createdAsset.id,
          buildingType: buildingType || 'Administrative Office',
          numberOfFloors: parseInt(numberOfFloors) || 4,
          builtUpArea: parseFloat(builtUpArea) || 5000.0
        }
      });
    }

    await prisma.lifecycleEvent.create({
      data: {
        assetId: createdAsset.id,
        eventType: EventType.CONSTRUCTED,
        eventDate: constrDate,
        description: `Infrastructure asset constructed at ${location}, ${district}.`,
        performedBy: responsibleDivision || 'R&B Department'
      }
    });

    await prisma.lifecycleEvent.create({
      data: {
        assetId: createdAsset.id,
        eventType: EventType.REGISTERED,
        eventDate: new Date(),
        description: `Digital Asset Passport created. Asset Code: ${code}. Registered by ${req.user?.name || 'System Admin'}.`,
        performedBy: req.user?.name || 'System Admin'
      }
    });

    await recalculateAndSaveAssetRisk(createdAsset.id);

    const fullAsset = await prisma.asset.findUnique({
      where: { id: createdAsset.id },
      include: {
        roadDetails: true,
        bridgeDetails: true,
        buildingDetails: true,
        riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
      }
    });

    res.status(201).json(fullAsset);
  } catch (error: any) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset', details: error.message });
  }
});

// PUT /api/assets/:id - Update Asset
router.put('/:id', requirePermission('ASSET_EDIT'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      district,
      location,
      latitude,
      longitude,
      currentCondition,
      criticality,
      responsibleDivision,
      status,
      roadLength,
      roadCategory,
      surfaceType,
      bridgeLength,
      bridgeType,
      numberOfLanes,
      buildingType,
      numberOfFloors,
      builtUpArea
    } = req.body;

    const existingAsset = await prisma.asset.findUnique({ where: { id } });
    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (!canAccessCategory(req.user, existingAsset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot modify a ${existingAsset.assetType}.`
      });
    }

    const updatedAsset = await prisma.asset.update({
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

    if (existingAsset.assetType === AssetType.ROAD) {
      await prisma.roadDetails.upsert({
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
    } else if (existingAsset.assetType === AssetType.BRIDGE) {
      await prisma.bridgeDetails.upsert({
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
    } else if (existingAsset.assetType === AssetType.BUILDING) {
      await prisma.buildingDetails.upsert({
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

    if (currentCondition && currentCondition !== existingAsset.currentCondition) {
      await prisma.lifecycleEvent.create({
        data: {
          assetId: id,
          eventType: EventType.CONDITION_UPDATED,
          description: `Asset condition updated from ${existingAsset.currentCondition} to ${currentCondition}.`,
          performedBy: req.user?.name || responsibleDivision || 'Asset Manager'
        }
      });
    }

    if (status && status !== existingAsset.status) {
      await prisma.lifecycleEvent.create({
        data: {
          assetId: id,
          eventType: EventType.STATUS_CHANGED,
          description: `Asset status changed from ${existingAsset.status} to ${status}.`,
          performedBy: req.user?.name || responsibleDivision || 'Asset Manager'
        }
      });
    }

    await recalculateAndSaveAssetRisk(id);

    const fullUpdated = await prisma.asset.findUnique({
      where: { id },
      include: {
        roadDetails: true,
        bridgeDetails: true,
        buildingDetails: true,
        riskAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
      }
    });

    res.json(fullUpdated);
  } catch (error: any) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset', details: error.message });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', requirePermission('ASSET_DELETE'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingAsset = await prisma.asset.findUnique({ where: { id } });
    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (!canAccessCategory(req.user, existingAsset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot delete a ${existingAsset.assetType}.`
      });
    }

    await prisma.asset.delete({ where: { id } });
    res.json({ message: 'Asset deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset', details: error.message });
  }
});

// GET /api/assets/:id/lifecycle
router.get('/:id/lifecycle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const events = await prisma.lifecycleEvent.findMany({
      where: { assetId: id },
      orderBy: { eventDate: 'desc' }
    });
    res.json(events);
  } catch (error: any) {
    console.error('Error fetching lifecycle:', error);
    res.status(500).json({ error: 'Failed to fetch lifecycle events', details: error.message });
  }
});

// GET /api/assets/:id/risk
router.get('/:id/risk', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const risk = await prisma.riskAssessment.findFirst({
      where: { assetId: id },
      orderBy: { assessedAt: 'desc' }
    });
    res.json(risk);
  } catch (error: any) {
    console.error('Error fetching risk assessment:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment', details: error.message });
  }
});

export default router;
