export type Role = 'SUPER_ADMIN' | 'RNB_ADMIN' | 'ROAD_OFFICER' | 'BRIDGE_OFFICER' | 'BUILDING_OFFICER' | 'FIELD_OFFICER';
export type AssetType = 'ROAD' | 'BRIDGE' | 'BUILDING';
export type Condition = 'GOOD' | 'MODERATE' | 'POOR' | 'CRITICAL';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type AssetStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'RETIRED';
export type MaintenanceStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventType =
  | 'CONSTRUCTED'
  | 'REGISTERED'
  | 'INSPECTED'
  | 'CONDITION_UPDATED'
  | 'MAINTENANCE_CREATED'
  | 'MAINTENANCE_STARTED'
  | 'MAINTENANCE_COMPLETED'
  | 'REPAIRED'
  | 'STATUS_CHANGED'
  | 'RETIRED';

export interface RoadDetails {
  id: string;
  assetId: string;
  roadLength: number;
  roadCategory: string;
  surfaceType: string;
}

export interface BridgeDetails {
  id: string;
  assetId: string;
  bridgeLength: number;
  bridgeType: string;
  numberOfLanes: number;
}

export interface BuildingDetails {
  id: string;
  assetId: string;
  buildingType: string;
  numberOfFloors: number;
  builtUpArea: number;
}

export interface RiskAssessment {
  id: string;
  assetId: string;
  conditionScore: number;
  ageScore: number;
  criticalityScore: number;
  maintenanceScore: number;
  totalRiskScore: number;
  riskLevel: RiskLevel;
  assessedAt: string;
}

export interface Inspection {
  id: string;
  assetId: string;
  inspectionDate: string;
  inspectorName: string;
  condition: Condition;
  observations: string;
  recommendedAction: string;
  photoUrl?: string | null;
  createdAt: string;
  asset?: {
    id: string;
    assetCode: string;
    name: string;
    assetType: AssetType;
    district: string;
    currentCondition: Condition;
  };
}

export interface Maintenance {
  id: string;
  assetId: string;
  issue: string;
  priority: MaintenancePriority;
  action: string;
  assignedTo: string;
  expectedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  cost: number;
  status: MaintenanceStatus;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    assetCode: string;
    name: string;
    assetType: AssetType;
    district: string;
    currentCondition: Condition;
    criticality: Criticality;
    status: AssetStatus;
  };
}

export interface LifecycleEvent {
  id: string;
  assetId: string;
  eventType: EventType;
  eventDate: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  assetType: AssetType;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  constructionDate: string;
  currentCondition: Condition;
  criticality: Criticality;
  responsibleDivision: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
  roadDetails?: RoadDetails | null;
  bridgeDetails?: BridgeDetails | null;
  buildingDetails?: BuildingDetails | null;
  inspections?: Inspection[];
  maintenances?: Maintenance[];
  lifecycleEvents?: LifecycleEvent[];
  riskAssessments?: RiskAssessment[];
  latestRisk?: RiskAssessment | null;
  latestInspection?: Inspection | null;
  latestMaintenance?: Maintenance | null;
  age?: number;
  totalMaintenanceCost?: number;
  recommendedAction?: string;
}

export interface CategorySummaryCard {
  total: number;
  critical: number;
  highRisk: number;
  maintenanceDue: number;
}

export interface DashboardStats {
  categoryFilter?: string;
  totals: {
    totalAssets: number;
    totalRoads: number;
    totalBridges: number;
    totalBuildings: number;
  };
  categoryCards?: {
    roads: CategorySummaryCard;
    bridges: CategorySummaryCard;
    buildings: CategorySummaryCard;
  };
  conditionDistribution: {
    good: number;
    moderate: number;
    poor: number;
    critical: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  maintenanceStatusDistribution: {
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
  };
  dues: {
    inspectionsDue: number;
    maintenanceDue: number;
  };
  assetsRequiringAttention: {
    id: string;
    assetCode: string;
    name: string;
    assetType: AssetType;
    district: string;
    currentCondition: Condition;
    riskScore: number;
    riskLevel: RiskLevel;
    maintenanceStatus: string;
    recommendedAction: string;
  }[];
}
