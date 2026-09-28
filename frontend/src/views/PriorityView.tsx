import React, { useEffect, useState } from 'react';
import { Asset } from '../types/asset';
import { api } from '../services/api';
import { ConditionBadge, RiskBadge, TypeBadge, MaintenanceStatusBadge } from '../components/Badges';
import { AlertTriangle, ShieldAlert, Wrench, Eye, ArrowUpRight } from 'lucide-react';

interface PriorityViewProps {
  onOpenAssetPassport: (assetId: string) => void;
  onOpenAddMaintenance: (assetId: string) => void;
}

export const PriorityView: React.FC<PriorityViewProps> = ({
  onOpenAssetPassport,
  onOpenAddMaintenance,
}) => {
  const [priorityAssets, setPriorityAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPriorityAssets();
  }, []);

  const fetchPriorityAssets = () => {
    setLoading(true);
    api.getAssets()
      .then((data) => {
        // Sort by risk score descending
        const sorted = data.sort((a, b) => {
          const scoreA = a.latestRisk?.totalRiskScore || 0;
          const scoreB = b.latestRisk?.totalRiskScore || 0;
          return scoreB - scoreA;
        });
        setPriorityAssets(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Maintenance Priority Matrix
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Assets Requiring Immediate Intervention
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rule-based explainable risk score ranking: Condition (40%) + Age (20%) + Criticality (20%) + Maintenance (20%)
          </p>
        </div>
      </div>

      {/* Priority Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span>Calculating priority rankings...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Priority Rank</th>
                  <th className="py-3.5 px-4">Asset ID</th>
                  <th className="py-3.5 px-4">Asset Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">District</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Total Risk Index</th>
                  <th className="py-3.5 px-4">Work Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {priorityAssets.map((asset, index) => {
                  const riskScore = asset.latestRisk?.totalRiskScore || 0;
                  const isCritical = riskScore >= 75 || asset.currentCondition === 'CRITICAL';

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => onOpenAssetPassport(asset.id)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isCritical ? 'bg-red-50/60' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-outfit text-xs ${
                          index === 0 ? 'bg-red-600 text-white font-extrabold shadow-sm' :
                          index < 3 ? 'bg-amber-500 text-white font-bold' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {asset.assetCode}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{asset.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{asset.location}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <TypeBadge type={asset.assetType} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {asset.district}
                      </td>

                      <td className="py-3.5 px-4">
                        <ConditionBadge condition={asset.currentCondition} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {asset.latestRisk ? (
                          <RiskBadge riskLevel={asset.latestRisk.riskLevel} score={asset.latestRisk.totalRiskScore} size="sm" />
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <MaintenanceStatusBadge status={asset.latestMaintenance?.status as any || 'NO_WORK_ORDER'} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenAssetPassport(asset.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" /> Passport
                          </button>
                          <button
                            onClick={() => onOpenAddMaintenance(asset.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition"
                          >
                            <Wrench className="w-3.5 h-3.5 inline mr-1" /> Issue Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
