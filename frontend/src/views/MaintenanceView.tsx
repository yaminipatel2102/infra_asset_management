import React, { useEffect, useState } from 'react';
import { Maintenance, MaintenanceStatus } from '../types/asset';
import { api } from '../services/api';
import { MaintenanceStatusBadge, PriorityBadge, TypeBadge } from '../components/Badges';
import { Wrench, Plus, Calendar, DollarSign, ExternalLink, Edit3, Eye } from 'lucide-react';

interface MaintenanceViewProps {
  onOpenAddMaintenance: (assetId?: string) => void;
  onOpenUpdateMaintenance: (maint: Maintenance) => void;
  onOpenEvidenceLightbox: (before?: string, after?: string) => void;
  onOpenAssetPassport: (assetId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onOpenAddMaintenance,
  onOpenUpdateMaintenance,
  onOpenEvidenceLightbox,
  onOpenAssetPassport,
}) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchMaintenance();
  }, [filterStatus]);

  const fetchMaintenance = () => {
    setLoading(true);
    api.getMaintenanceList({ status: filterStatus })
      .then(setMaintenances)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const statuses: MaintenanceStatus[] = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-600" /> Maintenance Work Orders & Evidence
          </h2>
          <p className="text-xs text-slate-500 mt-1">Track contractor assignments, work status transitions & photo evidence</p>
        </div>

        <button
          onClick={() => onOpenAddMaintenance()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> + Issue New Work Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 text-xs shadow-sm">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            filterStatus === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Orders ({maintenances.length})
        </button>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              filterStatus === st ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Work Orders List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading work order records...</span>
          </div>
        ) : maintenances.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-700">No work orders match the filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenances.map((maint) => (
              <div
                key={maint.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-3 transition flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                        {maint.asset?.assetCode}
                      </span>
                      {maint.asset?.assetType && <TypeBadge type={maint.asset.assetType} size="sm" />}
                    </div>
                    <MaintenanceStatusBadge status={maint.status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-outfit">
                    {maint.issue}
                  </h3>

                  <div className="text-xs text-slate-500 font-medium">
                    Target: <strong className="text-slate-800">{maint.asset?.name} ({maint.asset?.district})</strong>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Assigned Agency: <strong className="text-slate-900">{maint.assignedTo}</strong></span>
                      <PriorityBadge priority={maint.priority} size="sm" />
                    </div>
                    <div className="text-slate-700 pt-1">
                      <strong>Scope:</strong> {maint.action}
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                      <span>Est. Cost: <strong className="text-emerald-600 font-bold">₹{maint.cost.toLocaleString('en-IN')}</strong></span>
                      {maint.expectedCompletionDate && (
                        <span>Due: {new Date(maint.expectedCompletionDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Evidence */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {(maint.beforePhotoUrl || maint.afterPhotoUrl) ? (
                      <button
                        onClick={() => onOpenEvidenceLightbox(maint.beforePhotoUrl || undefined, maint.afterPhotoUrl || undefined)}
                        className="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Evidence Photos
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No photos attached</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenAssetPassport(maint.assetId)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Passport
                      </button>
                      <button
                        onClick={() => onOpenUpdateMaintenance(maint)}
                        className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
