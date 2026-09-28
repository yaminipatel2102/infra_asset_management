"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAssetRisk = calculateAssetRisk;
const client_1 = require("@prisma/client");
function calculateAssetRisk(input) {
    // 1. Condition Score (Max 40 points)
    let conditionScore = 5;
    switch (input.currentCondition) {
        case client_1.Condition.GOOD:
            conditionScore = 5;
            break;
        case client_1.Condition.MODERATE:
            conditionScore = 20;
            break;
        case client_1.Condition.POOR:
            conditionScore = 32;
            break;
        case client_1.Condition.CRITICAL:
            conditionScore = 40;
            break;
    }
    // 2. Age Score (Max 20 points)
    const constrYear = new Date(input.constructionDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - constrYear);
    let ageScore = 4;
    if (age <= 5) {
        ageScore = 4;
    }
    else if (age <= 15) {
        ageScore = 8;
    }
    else if (age <= 30) {
        ageScore = 14;
    }
    else {
        ageScore = 20;
    }
    // 3. Criticality Score (Max 20 points)
    let criticalityScore = 10;
    switch (input.criticality) {
        case client_1.Criticality.LOW:
            criticalityScore = 5;
            break;
        case client_1.Criticality.MEDIUM:
            criticalityScore = 10;
            break;
        case client_1.Criticality.HIGH:
            criticalityScore = 15;
            break;
        case client_1.Criticality.VERY_HIGH:
            criticalityScore = 20;
            break;
    }
    // 4. Maintenance Score (Max 20 points)
    let maintenanceScore = 0;
    if (input.activeMaintenancePriority) {
        switch (input.activeMaintenancePriority) {
            case client_1.MaintenancePriority.CRITICAL:
                maintenanceScore = 20;
                break;
            case client_1.MaintenancePriority.HIGH:
                maintenanceScore = 15;
                break;
            case client_1.MaintenancePriority.MEDIUM:
                maintenanceScore = 10;
                break;
            case client_1.MaintenancePriority.LOW:
                maintenanceScore = 5;
                break;
        }
    }
    const totalRiskScore = Math.min(100, conditionScore + ageScore + criticalityScore + maintenanceScore);
    let riskLevel = client_1.RiskLevel.LOW;
    if (totalRiskScore >= 75) {
        riskLevel = client_1.RiskLevel.CRITICAL;
    }
    else if (totalRiskScore >= 50) {
        riskLevel = client_1.RiskLevel.HIGH;
    }
    else if (totalRiskScore >= 25) {
        riskLevel = client_1.RiskLevel.MEDIUM;
    }
    else {
        riskLevel = client_1.RiskLevel.LOW;
    }
    return {
        conditionScore,
        ageScore,
        criticalityScore,
        maintenanceScore,
        totalRiskScore,
        riskLevel,
    };
}
