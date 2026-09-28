import React, { useState } from 'react';
import { Asset, AssetType, Condition, RiskLevel, AssetStatus } from '../types/asset';
import { ConditionBadge, RiskBadge, StatusBadge, TypeBadge, MaintenanceStatusBadge } from '../components/Badges';
import { Search, Filter, Plus, Trash2, Edit3, Eye, Building2 } from 'lucide-react';

interface AssetInventoryViewProps {
  assets: Asset[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  selectedCondition: string;
  setSelectedCondition: (c: string) => void;
  selectedRisk: string;
  setSelectedRisk: (r: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  onOpenAssetPassport: (assetId: string) => void;
  onOpenAddAsset: () => void;
  onOpenEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetInventoryView: React.FC<AssetInventoryViewProps> = ({
  assets,
  loading,
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedCondition,
  setSelectedCondition,
  selectedRisk,
  setSelectedRisk,
  selectedStatus,
  setSelectedStatus,
  onOpenAssetPassport,
  onOpenAddAsset,
  onOpenEditAsset,
  onDeleteAsset,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Infrastructure Asset Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-1">Search, filter and inspect Digital Asset Passports across all R&B divisions</p>
        </div>

        <button
          onClick={onOpenAddAsset}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> + Register New Asset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-white border border-slate-200 rounded-2xl text-xs shadow-sm">
        {/* Type */}
        <div>
          <label className="text-slate-600 font-semibold block mb-1">Asset Category</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD">Roads</option>
            <option value="BRIDGE">Bridges</option>
            <option value="BUILDING">Buildings</option>
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="text-slate-600 font-semibold block mb-1">Current Condition</label>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Conditions</option>
            <option value="GOOD">Good</option>
            <option value="MODERATE">Moderate</option>
            <option value="POOR">Poor</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="text-slate-600 font-semibold block mb-1">Risk Level</label>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Operational Status */}
        <div>
          <label className="text-slate-600 font-semibold block mb-1">Operational Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('ALL');
              setSelectedCondition('ALL');
              setSelectedRisk('ALL');
              setSelectedStatus('ALL');
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Asset List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Fetching asset records from PostgreSQL...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-700">No assets match your search filters.</p>
            <p className="text-xs text-slate-400">Try resetting filters or searching a different term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Asset ID</th>
                  <th className="py-3.5 px-4">Asset Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">District</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Inspection</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => onOpenAssetPassport(asset.id)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
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
                      <StatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {asset.latestInspection
                        ? new Date(asset.latestInspection.inspectionDate).toLocaleDateString()
                        : 'No inspection'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenAssetPassport(asset.id)}
                          title="View Digital Asset Passport"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditAsset(asset)}
                          title="Edit Asset"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${asset.assetCode}?`)) {
                              onDeleteAsset(asset.id);
                            }
                          }}
                          title="Delete Asset"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
