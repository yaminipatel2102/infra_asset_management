import { prisma } from '../db/prisma';
import { calculateAssetRisk } from './riskEngine';
import { MaintenanceStatus, MaintenancePriority } from '@prisma/client';

export async function recalculateAndSaveAssetRisk(assetId: string) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      maintenances: {
        where: {
          status: {
            in: [MaintenanceStatus.PENDING, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS]
          }
        },
        orderBy: { priority: 'desc' }
      }
    }
  });

  if (!asset) return null;

  // Determine highest priority active maintenance if any
  let activeMaintenancePriority: MaintenancePriority | null = null;
  if (asset.maintenances.length > 0) {
    activeMaintenancePriority = asset.maintenances[0].priority;
  }

  const riskResult = calculateAssetRisk({
    constructionDate: asset.constructionDate,
    currentCondition: asset.currentCondition,
    criticality: asset.criticality,
    activeMaintenancePriority
  });

  const savedRisk = await prisma.riskAssessment.create({
    data: {
      assetId: asset.id,
      conditionScore: riskResult.conditionScore,
      ageScore: riskResult.ageScore,
      criticalityScore: riskResult.criticalityScore,
      maintenanceScore: riskResult.maintenanceScore,
      totalRiskScore: riskResult.totalRiskScore,
      riskLevel: riskResult.riskLevel,
    }
  });

  return savedRisk;
}
