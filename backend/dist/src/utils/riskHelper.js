"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateAndSaveAssetRisk = recalculateAndSaveAssetRisk;
const prisma_1 = require("../db/prisma");
const riskEngine_1 = require("./riskEngine");
const client_1 = require("@prisma/client");
async function recalculateAndSaveAssetRisk(assetId) {
    const asset = await prisma_1.prisma.asset.findUnique({
        where: { id: assetId },
        include: {
            maintenances: {
                where: {
                    status: {
                        in: [client_1.MaintenanceStatus.PENDING, client_1.MaintenanceStatus.ASSIGNED, client_1.MaintenanceStatus.IN_PROGRESS]
                    }
                },
                orderBy: { priority: 'desc' }
            }
        }
    });
    if (!asset)
        return null;
    // Determine highest priority active maintenance if any
    let activeMaintenancePriority = null;
    if (asset.maintenances.length > 0) {
        activeMaintenancePriority = asset.maintenances[0].priority;
    }
    const riskResult = (0, riskEngine_1.calculateAssetRisk)({
        constructionDate: asset.constructionDate,
        currentCondition: asset.currentCondition,
        criticality: asset.criticality,
        activeMaintenancePriority
    });
    const savedRisk = await prisma_1.prisma.riskAssessment.create({
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
