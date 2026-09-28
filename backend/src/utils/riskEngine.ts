import { Condition, Criticality, MaintenancePriority, RiskLevel } from '@prisma/client';

interface RiskInput {
  constructionDate: Date | string;
  currentCondition: Condition;
  criticality: Criticality;
  activeMaintenancePriority?: MaintenancePriority | null;
}

export interface RiskCalculationResult {
  conditionScore: number;
  ageScore: number;
  criticalityScore: number;
  maintenanceScore: number;
  totalRiskScore: number;
  riskLevel: RiskLevel;
}

export function calculateAssetRisk(input: RiskInput): RiskCalculationResult {
  // 1. Condition Score (Max 40 points)
  let conditionScore = 5;
  switch (input.currentCondition) {
    case Condition.GOOD:
      conditionScore = 5;
      break;
    case Condition.MODERATE:
      conditionScore = 20;
      break;
    case Condition.POOR:
      conditionScore = 32;
      break;
    case Condition.CRITICAL:
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
  } else if (age <= 15) {
    ageScore = 8;
  } else if (age <= 30) {
    ageScore = 14;
  } else {
    ageScore = 20;
  }

  // 3. Criticality Score (Max 20 points)
  let criticalityScore = 10;
  switch (input.criticality) {
    case Criticality.LOW:
      criticalityScore = 5;
      break;
    case Criticality.MEDIUM:
      criticalityScore = 10;
      break;
    case Criticality.HIGH:
      criticalityScore = 15;
      break;
    case Criticality.VERY_HIGH:
      criticalityScore = 20;
      break;
  }

  // 4. Maintenance Score (Max 20 points)
  let maintenanceScore = 0;
  if (input.activeMaintenancePriority) {
    switch (input.activeMaintenancePriority) {
      case MaintenancePriority.CRITICAL:
        maintenanceScore = 20;
        break;
      case MaintenancePriority.HIGH:
        maintenanceScore = 15;
        break;
      case MaintenancePriority.MEDIUM:
        maintenanceScore = 10;
        break;
      case MaintenancePriority.LOW:
        maintenanceScore = 5;
        break;
    }
  }

  const totalRiskScore = Math.min(100, conditionScore + ageScore + criticalityScore + maintenanceScore);

  let riskLevel: RiskLevel = RiskLevel.LOW;
  if (totalRiskScore >= 75) {
    riskLevel = RiskLevel.CRITICAL;
  } else if (totalRiskScore >= 50) {
    riskLevel = RiskLevel.HIGH;
  } else if (totalRiskScore >= 25) {
    riskLevel = RiskLevel.MEDIUM;
  } else {
    riskLevel = RiskLevel.LOW;
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
