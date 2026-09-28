import React from 'react';
import { Condition, RiskLevel, AssetStatus, AssetType, MaintenancePriority, MaintenanceStatus } from '../types/asset';
import { ShieldAlert, AlertTriangle, CheckCircle2, Shield, Wrench, Building2, Landmark, Navigation } from 'lucide-react';

export const ConditionBadge: React.FC<{ condition: Condition; size?: 'sm' | 'md' }> = ({ condition, size = 'md' }) => {
  const styles = {
    GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
    POOR: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',
  };

  const icons = {
    GOOD: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    MODERATE: <Shield className="w-3.5 h-3.5 mr-1 text-amber-600" />,
    POOR: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-orange-600" />,
    CRITICAL: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />,
  };

  return (
    <span className={`inline-flex items-center font-semibold border rounded-full px-2.5 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${styles[condition] || styles.GOOD}`}>
      {icons[condition]}
      {condition}
    </span>
  );
};

export const RiskBadge: React.FC<{ riskLevel: RiskLevel; score?: number; size?: 'sm' | 'md' }> = ({ riskLevel, score, size = 'md' }) => {
  const styles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  };

  return (
    <span className={`inline-flex items-center border rounded-md font-bold px-2 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${styles[riskLevel] || styles.LOW}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {riskLevel} {score !== undefined && `(${Math.round(score)}/100)`}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: AssetStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const styles = {
    ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
    UNDER_MAINTENANCE: 'bg-purple-50 text-purple-700 border-purple-200',
    RETIRED: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center font-semibold border rounded-full px-2.5 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${styles[status] || styles.ACTIVE}`}>
      {status === 'UNDER_MAINTENANCE' && <Wrench className="w-3 h-3 mr-1" />}
      {status.replace('_', ' ')}
    </span>
  );
};

export const TypeBadge: React.FC<{ type: AssetType; size?: 'sm' | 'md' }> = ({ type, size = 'md' }) => {
  const icons = {
    ROAD: <Navigation className="w-3.5 h-3.5 mr-1 text-sky-600" />,
    BRIDGE: <Landmark className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
    BUILDING: <Building2 className="w-3.5 h-3.5 mr-1 text-amber-600" />,
  };

  return (
    <span className={`inline-flex items-center font-semibold bg-slate-100 text-slate-800 border border-slate-200 rounded-md px-2 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {icons[type]}
      {type}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: MaintenancePriority; size?: 'sm' | 'md' }> = ({ priority, size = 'md' }) => {
  const styles = {
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',
  };

  return (
    <span className={`inline-flex items-center border rounded font-bold px-2 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${styles[priority] || styles.LOW}`}>
      {priority}
    </span>
  );
};

export const MaintenanceStatusBadge: React.FC<{ status: MaintenanceStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`inline-flex items-center font-semibold border rounded-full px-2.5 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${styles[status] || styles.PENDING}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
