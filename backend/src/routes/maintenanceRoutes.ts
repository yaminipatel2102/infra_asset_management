import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { MaintenanceStatus, MaintenancePriority, AssetStatus, EventType, AssetType } from '@prisma/client';
import { recalculateAndSaveAssetRisk } from '../utils/riskHelper';
import { authenticateToken, AuthenticatedRequest, getUserCategoryFilter, canAccessCategory } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/maintenance - Filtered by role category
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, assetId } = req.query;

    const userCat = getUserCategoryFilter(req.user);

    const where: any = {};
    if (userCat !== 'ALL') {
      where.asset = { assetType: userCat as AssetType };
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as MaintenanceStatus;
    }
    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      where.priority = priority as MaintenancePriority;
    }
    if (assetId && typeof assetId === 'string') {
      where.assetId = assetId;
    }

    const maintenances = await prisma.maintenance.findMany({
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
  } catch (error: any) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance work orders', details: error.message });
  }
});

// GET /api/maintenance/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: { asset: true }
    });
    if (!maintenance) return res.status(404).json({ error: 'Maintenance record not found' });

    if (!canAccessCategory(req.user, maintenance.asset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets.`
      });
    }

    res.json(maintenance);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch maintenance', details: error.message });
  }
});

// POST /api/maintenance - Create Work Order
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      assetId,
      issue,
      priority = MaintenancePriority.MEDIUM,
      action,
      assignedTo,
      expectedCompletionDate,
      cost = 0,
      status = MaintenanceStatus.PENDING,
      beforePhotoUrl
    } = req.body;

    if (!assetId || !issue || !assignedTo) {
      return res.status(400).json({ error: 'Missing required maintenance fields (assetId, issue, assignedTo)' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Target asset not found' });
    }

    if (!canAccessCategory(req.user, asset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets and cannot issue a work order for a ${asset.assetType}.`
      });
    }

    const newMaint = await prisma.maintenance.create({
      data: {
        assetId,
        issue,
        priority: priority as MaintenancePriority,
        action: action || 'Inspection & Repair',
        assignedTo,
        expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : null,
        cost: parseFloat(cost) || 0,
        status: status as MaintenanceStatus,
        beforePhotoUrl: beforePhotoUrl || null
      }
    });

    if (status === MaintenanceStatus.IN_PROGRESS || status === MaintenanceStatus.ASSIGNED) {
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.UNDER_MAINTENANCE }
      });
    }

    let evType: EventType = EventType.MAINTENANCE_CREATED;
    if (status === MaintenanceStatus.IN_PROGRESS) evType = EventType.MAINTENANCE_STARTED;

    await prisma.lifecycleEvent.create({
      data: {
        assetId,
        eventType: evType,
        description: `Maintenance Work Order created [Priority: ${priority}]: ${issue}. Assigned to ${assignedTo}.`,
        performedBy: assignedTo
      }
    });

    const updatedRisk = await recalculateAndSaveAssetRisk(assetId);

    res.status(201).json({
      maintenance: newMaint,
      latestRisk: updatedRisk
    });
  } catch (error: any) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ error: 'Failed to create work order', details: error.message });
  }
});

// PUT /api/maintenance/:id - Update work order
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      action,
      assignedTo,
      expectedCompletionDate,
      actualCompletionDate,
      cost,
      beforePhotoUrl,
      afterPhotoUrl
    } = req.body;

    const existing = await prisma.maintenance.findUnique({
      where: { id },
      include: { asset: true }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    if (!canAccessCategory(req.user, existing.asset.assetType)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role}) is restricted to ${req.user?.assetCategory} assets.`
      });
    }

    const isCompleting = status === MaintenanceStatus.COMPLETED && existing.status !== MaintenanceStatus.COMPLETED;
    const isStarting = status === MaintenanceStatus.IN_PROGRESS && existing.status !== MaintenanceStatus.IN_PROGRESS;

    const updatedMaint = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(status && { status: status as MaintenanceStatus }),
        ...(priority && { priority: priority as MaintenancePriority }),
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
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.UNDER_MAINTENANCE }
      });

      await prisma.lifecycleEvent.create({
        data: {
          assetId,
          eventType: EventType.MAINTENANCE_STARTED,
          description: `Work order started by ${updatedMaint.assignedTo}. Issue: ${updatedMaint.issue}`,
          performedBy: updatedMaint.assignedTo
        }
      });
    }

    if (isCompleting) {
      const otherPending = await prisma.maintenance.findMany({
        where: {
          assetId,
          id: { not: id },
          status: { in: [MaintenanceStatus.PENDING, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS] }
        }
      });

      if (otherPending.length === 0) {
        await prisma.asset.update({
          where: { id: assetId },
          data: { status: AssetStatus.ACTIVE }
        });
      }

      await prisma.lifecycleEvent.create({
        data: {
          assetId,
          eventType: EventType.MAINTENANCE_COMPLETED,
          description: `Maintenance work order completed. Final cost: ₹${(updatedMaint.cost || 0).toLocaleString('en-IN')}. Action taken: ${updatedMaint.action}`,
          performedBy: updatedMaint.assignedTo
        }
      });

      await prisma.lifecycleEvent.create({
        data: {
          assetId,
          eventType: EventType.REPAIRED,
          description: `Infrastructure asset repaired & restored to operational standards by ${updatedMaint.assignedTo}.`,
          performedBy: updatedMaint.assignedTo
        }
      });
    }

    const updatedRisk = await recalculateAndSaveAssetRisk(assetId);

    res.json({
      maintenance: updatedMaint,
      latestRisk: updatedRisk
    });
  } catch (error: any) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ error: 'Failed to update work order', details: error.message });
  }
});

export default router;
