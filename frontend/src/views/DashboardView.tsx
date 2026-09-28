import React from 'react';
import { DashboardStats, Asset } from '../types/asset';
import { ConditionBadge, RiskBadge, TypeBadge, MaintenanceStatusBadge } from '../components/Badges';
import { MapView } from '../components/MapView';
import {
  Building2,
  Navigation,
  Landmark,
  ShieldAlert,
  AlertTriangle,
  ClipboardCheck,
  Wrench,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  assets: Asset[];
  loading: boolean;
  selectedCategory: 'ALL' | 'ROAD' | 'BRIDGE' | 'BUILDING';
  setSelectedCategory: (cat: 'ALL' | 'ROAD' | 'BRIDGE' | 'BUILDING') => void;
  onOpenAssetPassport: (assetId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenAddInspection: (assetId?: string) => void;
  onOpenAddMaintenance: (assetId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  assets,
  loading,
  selectedCategory,
  setSelectedCategory,
  onOpenAssetPassport,
  onNavigateToTab,
  onOpenAddInspection,
  onOpenAddMaintenance,
}) => {
  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-xs">Loading R&B Dashboard statistics from PostgreSQL...</span>
      </div>
    );
  }

  // Filter title helper
  const dashboardTitle = selectedCategory === 'ALL'
    ? 'R&B Infrastructure Master Dashboard'
    : `${selectedCategory === 'ROAD' ? 'Roads' : selectedCategory === 'BRIDGE' ? 'Bridges' : 'Government Buildings'} Infrastructure Overview`;

  // Chart Data Setup
  const categoryData = [
    { name: 'Roads', value: stats.totals.totalRoads, color: '#0284c7' },
    { name: 'Bridges', value: stats.totals.totalBridges, color: '#4f46e5' },
    { name: 'Buildings', value: stats.totals.totalBuildings, color: '#d97706' },
  ];

  const conditionData = [
    { name: 'Good', value: stats.conditionDistribution.good, color: '#10b981' },
    { name: 'Moderate', value: stats.conditionDistribution.moderate, color: '#f59e0b' },
    { name: 'Poor', value: stats.conditionDistribution.poor, color: '#f97316' },
    { name: 'Critical', value: stats.conditionDistribution.critical, color: '#ef4444' },
  ];

  const riskData = [
    { name: 'Low Risk', value: stats.riskDistribution.low, color: '#10b981' },
    { name: 'Medium Risk', value: stats.riskDistribution.medium, color: '#f59e0b' },
    { name: 'High Risk', value: stats.riskDistribution.high, color: '#f97316' },
    { name: 'Critical Risk', value: stats.riskDistribution.critical, color: '#ef4444' },
  ];

  const maintenanceData = [
    { name: 'Pending', value: stats.maintenanceStatusDistribution.pending, fill: '#f59e0b' },
    { name: 'Assigned', value: stats.maintenanceStatusDistribution.assigned, fill: '#2563eb' },
    { name: 'In Progress', value: stats.maintenanceStatusDistribution.inProgress, fill: '#9333ea' },
    { name: 'Completed', value: stats.maintenanceStatusDistribution.completed, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header & Category Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-blue-600" /> Executive Infrastructure Dashboard
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
            {dashboardTitle}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time PostgreSQL lifecycle tracking, explainable risk assessment engine & work order monitoring
          </p>
        </div>

        {/* Dynamic Category Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> All Assets
          </button>
          <button
            onClick={() => setSelectedCategory('ROAD')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === 'ROAD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" /> Roads
          </button>
          <button
            onClick={() => setSelectedCategory('BRIDGE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === 'BRIDGE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Bridges
          </button>
          <button
            onClick={() => setSelectedCategory('BUILDING')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === 'BUILDING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Buildings
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Assets */}
        <div
          onClick={() => onNavigateToTab('assets')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {selectedCategory === 'ALL' ? 'Total Assets' : `Total ${selectedCategory}s`}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition border border-blue-100">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-outfit">
            {stats.totals.totalAssets}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {selectedCategory === 'ALL'
              ? `${stats.totals.totalRoads} Roads • ${stats.totals.totalBridges} Bridges • ${stats.totals.totalBuildings} Buildings`
              : `Filtered to ${selectedCategory} infrastructure`}
          </div>
        </div>

        {/* Card 2: Condition Summary */}
        <div
          onClick={() => onNavigateToTab('assets')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Condition Summary</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-emerald-600 font-outfit">
              {stats.conditionDistribution.good}
            </div>
            <span className="text-xs text-slate-500 font-semibold">Good</span>
            <div className="text-xl font-bold text-rose-600 ml-auto font-outfit">
              {stats.conditionDistribution.critical}
            </div>
            <span className="text-xs text-rose-600 font-bold">Critical</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {stats.conditionDistribution.moderate} Moderate • {stats.conditionDistribution.poor} Poor
          </div>
        </div>

        {/* Card 3: High Risk */}
        <div
          onClick={() => onNavigateToTab('priority')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-rose-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High & Critical Risk</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-outfit">
            {stats.riskDistribution.critical + stats.riskDistribution.high}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {stats.riskDistribution.critical} Critical Level • {stats.riskDistribution.high} High Level
          </div>
        </div>

        {/* Card 4: Work Orders Due */}
        <div
          onClick={() => onNavigateToTab('maintenance')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-purple-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Work Orders Due</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition border border-purple-100">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-700 font-outfit">
            {stats.dues.maintenanceDue}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {stats.maintenanceStatusDistribution.inProgress} In Progress • {stats.dues.inspectionsDue} Inspections Due
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedCategory === 'ALL' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 self-start">
              Category Distribution
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 self-start">
            Condition Breakdown
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conditionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4}>
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 self-start">
            Risk Distribution
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 self-start">
            Work Order Status
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {maintenanceData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Embedded GIS Map Section */}
      <MapView
        assets={assets}
        categoryFilter={selectedCategory}
        onSelectAsset={onOpenAssetPassport}
      />

      {/* Assets Requiring Immediate Attention Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-outfit flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> {selectedCategory !== 'ALL' ? `${selectedCategory} Infrastructure` : 'Assets'} Requiring Urgent Attention
            </h3>
            <p className="text-xs text-slate-500 font-medium">High & Critical Risk assets ordered by explainable risk index score</p>
          </div>

          <button
            onClick={() => onNavigateToTab('priority')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View Priority Matrix <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3.5 px-4">Asset ID</th>
                <th className="py-3.5 px-4">Asset Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">District</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4">Risk Index</th>
                <th className="py-3.5 px-4">Maintenance</th>
                <th className="py-3.5 px-4">Recommended Governance Action</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.assetsRequiringAttention.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => onOpenAssetPassport(asset.id)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {asset.assetCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {asset.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <TypeBadge type={asset.assetType} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    {asset.district}
                  </td>
                  <td className="py-3.5 px-4">
                    <ConditionBadge condition={asset.currentCondition} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge riskLevel={asset.riskLevel} score={asset.riskScore} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <MaintenanceStatusBadge status={asset.maintenanceStatus as any} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 font-medium" title={asset.recommendedAction}>
                    {asset.recommendedAction}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAssetPassport(asset.id);
                      }}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-lg font-bold transition"
                    >
                      Passport →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
