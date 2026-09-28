import React, { useEffect, useState } from 'react';
import { Asset, LifecycleEvent } from '../types/asset';
import { ConditionBadge, RiskBadge, StatusBadge, TypeBadge, MaintenanceStatusBadge } from './Badges';
import { api } from '../services/api';
import {
  X,
  Calendar,
  MapPin,
  Building2,
  Wrench,
  ClipboardCheck,
  History,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus,
  Compass,
  DollarSign
} from 'lucide-react';

interface PassportModalProps {
  assetId: string | null;
  onClose: () => void;
  onOpenAddInspection: (assetId: string) => void;
  onOpenAddMaintenance: (assetId: string) => void;
  onOpenEditAsset: (asset: Asset) => void;
  onOpenEvidenceLightbox: (before?: string, after?: string) => void;
}

export const DigitalAssetPassportModal: React.FC<PassportModalProps> = ({
  assetId,
  onClose,
  onOpenAddInspection,
  onOpenAddMaintenance,
  onOpenEditAsset,
  onOpenEvidenceLightbox,
}) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'passport' | 'lifecycle' | 'inspections' | 'maintenance'>('passport');

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    Promise.all([
      api.getAssetById(assetId),
      api.getAssetLifecycle(assetId)
    ])
      .then(([assetData, lifecycleData]) => {
        setAsset(assetData);
        setLifecycleEvents(lifecycleData);
      })
      .catch((err) => console.error('Error fetching passport data:', err))
      .finally(() => setLoading(false));
  }, [assetId]);

  if (!assetId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
                {asset?.assetCode}
              </span>
              {asset?.assetType && <TypeBadge type={asset.assetType} />}
              {asset?.currentCondition && <ConditionBadge condition={asset.currentCondition} />}
              {asset?.latestRisk && <RiskBadge riskLevel={asset.latestRisk.riskLevel} score={asset.latestRisk.totalRiskScore} />}
              {asset?.status && <StatusBadge status={asset.status} />}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
              {asset?.name}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {asset?.location}, <strong className="text-slate-800">{asset?.district} District</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Built: {asset?.constructionDate ? new Date(asset.constructionDate).toLocaleDateString() : 'N/A'} ({asset?.age} yrs)
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Division: {asset?.responsibleDivision}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'passport'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" /> Digital Passport & Risk Engine
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'lifecycle'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Lifecycle Timeline ({lifecycleEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'inspections'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" /> Inspection History ({asset?.inspections?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-3 font-semibold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'maintenance'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" /> Maintenance Work Orders ({asset?.maintenances?.length || 0})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading Digital Asset Passport from PostgreSQL...</span>
            </div>
          ) : asset ? (
            <>
              {activeTab === 'passport' && (
                <div className="space-y-6">
                  {/* Next Recommended Action Banner */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Next Recommended Governance Action
                      </span>
                      <p className="text-sm font-semibold text-slate-900">
                        {asset.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {/* 2-Column Specs & Risk Assessment */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Asset Subtype Specifications */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Building2 className="w-4 h-4 text-blue-600" /> Structural & Domain Details
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block mb-0.5">Criticality Level</span>
                          <span className="font-bold text-slate-800 text-sm">{asset.criticality}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block mb-0.5">GPS Coordinates</span>
                          <span className="font-mono font-semibold text-slate-700">{asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}</span>
                        </div>

                        {asset.assetType === 'ROAD' && asset.roadDetails && (
                          <>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block mb-0.5">Road Length</span>
                              <span className="font-bold text-slate-900">{asset.roadDetails.roadLength} km</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block mb-0.5">Category</span>
                              <span className="font-bold text-slate-900">{asset.roadDetails.roadCategory}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2">
                              <span className="text-slate-500 block mb-0.5">Surface Material</span>
                              <span className="font-bold text-blue-700">{asset.roadDetails.surfaceType}</span>
                            </div>
                          </>
                        )}

                        {asset.assetType === 'BRIDGE' && asset.bridgeDetails && (
                          <>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block mb-0.5">Bridge Length</span>
                              <span className="font-bold text-slate-900">{asset.bridgeDetails.bridgeLength} meters</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block mb-0.5">Lanes</span>
                              <span className="font-bold text-slate-900">{asset.bridgeDetails.numberOfLanes} Lanes</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2">
                              <span className="text-slate-500 block mb-0.5">Bridge Structural Type</span>
                              <span className="font-bold text-indigo-700">{asset.bridgeDetails.bridgeType}</span>
                            </div>
                          </>
                        )}

                        {asset.assetType === 'BUILDING' && asset.buildingDetails && (
                          <>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block mb-0.5">Floors</span>
                              <span className="font-bold text-slate-900">{asset.buildingDetails.numberOfFloors} Floors</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block mb-0.5">Built-up Area</span>
                              <span className="font-bold text-slate-900">{asset.buildingDetails.builtUpArea.toLocaleString()} sq m</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2">
                              <span className="text-slate-500 block mb-0.5">Building Functional Type</span>
                              <span className="font-bold text-amber-700">{asset.buildingDetails.buildingType}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Explainable Risk Engine Breakdown */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" /> Explainable Risk Assessment
                        </h3>
                        {asset.latestRisk && (
                          <RiskBadge riskLevel={asset.latestRisk.riskLevel} score={asset.latestRisk.totalRiskScore} />
                        )}
                      </div>

                      {asset.latestRisk ? (
                        <div className="space-y-3">
                          {/* Risk Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                              <span>Risk Index Score</span>
                              <span>{Math.round(asset.latestRisk.totalRiskScore)} / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  asset.latestRisk.totalRiskScore >= 75
                                    ? 'bg-red-500'
                                    : asset.latestRisk.totalRiskScore >= 50
                                    ? 'bg-orange-500'
                                    : asset.latestRisk.totalRiskScore >= 25
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, asset.latestRisk.totalRiskScore)}%` }}
                              />
                            </div>
                          </div>

                          {/* Rule Breakdown Cards */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Condition (40%)</span>
                              <span className="font-bold text-slate-800">{asset.latestRisk.conditionScore} / 40</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Age Factor (20%)</span>
                              <span className="font-bold text-slate-800">{asset.latestRisk.ageScore} / 20</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Criticality (20%)</span>
                              <span className="font-bold text-slate-800">{asset.latestRisk.criticalityScore} / 20</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">Maintenance (20%)</span>
                              <span className="font-bold text-slate-800">{asset.latestRisk.maintenanceScore} / 20</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                            <strong>Formula:</strong> Total Risk = Condition ({asset.latestRisk.conditionScore}) + Age ({asset.latestRisk.ageScore}) + Criticality ({asset.latestRisk.criticalityScore}) + Maintenance ({asset.latestRisk.maintenanceScore}) = <strong>{asset.latestRisk.totalRiskScore}/100</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 text-center py-6">No risk assessment calculated.</div>
                      )}
                    </div>
                  </div>

                  {/* Summary Cards: Inspection & Maintenance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latest Inspection */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Latest Inspection Record
                        </h4>
                        <button
                          onClick={() => onOpenAddInspection(asset.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Inspect Now
                        </button>
                      </div>

                      {asset.latestInspection ? (
                        <div className="space-y-2 text-xs text-slate-700">
                          <div className="flex justify-between text-slate-500">
                            <span>Date: {new Date(asset.latestInspection.inspectionDate).toLocaleDateString()}</span>
                            <span>Inspector: <strong>{asset.latestInspection.inspectorName}</strong></span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800">
                            "{asset.latestInspection.observations}"
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">No field inspection recorded yet.</div>
                      )}
                    </div>

                    {/* Latest Maintenance & Evidence */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-indigo-600" /> Active Work Order & Evidence
                        </h4>
                        <button
                          onClick={() => onOpenAddMaintenance(asset.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Issue Order
                        </button>
                      </div>

                      {asset.latestMaintenance ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-900">{asset.latestMaintenance.issue}</span>
                            <MaintenanceStatusBadge status={asset.latestMaintenance.status} size="sm" />
                          </div>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>Assigned: {asset.latestMaintenance.assignedTo}</span>
                            <span>Cost: ₹{asset.latestMaintenance.cost.toLocaleString('en-IN')}</span>
                          </div>

                          {(asset.latestMaintenance.beforePhotoUrl || asset.latestMaintenance.afterPhotoUrl) && (
                            <button
                              onClick={() =>
                                onOpenEvidenceLightbox(
                                  asset.latestMaintenance?.beforePhotoUrl || undefined,
                                  asset.latestMaintenance?.afterPhotoUrl || undefined
                                )
                              }
                              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Before / After Evidence Photos
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">No active maintenance work orders.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lifecycle Vertical Timeline */}
              {activeTab === 'lifecycle' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-blue-600" /> Complete Database Lifecycle Timeline
                  </h3>

                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                    {lifecycleEvents.map((ev) => (
                      <div key={ev.id} className="relative group">
                        {/* Timeline node icon */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm group-hover:scale-125 transition-all" />

                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {ev.eventType}
                            </span>
                            <span className="text-slate-500">
                              {new Date(ev.eventDate).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 pt-1">
                            {ev.description}
                          </p>
                          <div className="text-xs text-slate-500">
                            Logged by: <strong className="text-slate-700">{ev.performedBy}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspections Tab */}
              {activeTab === 'inspections' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Inspection Log History
                    </h3>
                    <button
                      onClick={() => onOpenAddInspection(asset.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> + New Inspection
                    </button>
                  </div>

                  <div className="space-y-3">
                    {asset.inspections && asset.inspections.length > 0 ? (
                      asset.inspections.map((insp) => (
                        <div key={insp.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <ConditionBadge condition={insp.condition} size="sm" />
                              <span className="text-slate-500 font-medium">Date: {new Date(insp.inspectionDate).toLocaleDateString()}</span>
                            </div>
                            <span className="text-slate-500">Inspector: <strong className="text-slate-700">{insp.inspectorName}</strong></span>
                          </div>
                          <p className="text-sm text-slate-800">"{insp.observations}"</p>
                          <div className="text-xs text-blue-700 font-semibold bg-blue-50 p-2 rounded border border-blue-200">
                            Recommended: {insp.recommendedAction}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-10">No inspections recorded yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === 'maintenance' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Maintenance Work Orders
                    </h3>
                    <button
                      onClick={() => onOpenAddMaintenance(asset.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> + Work Order
                    </button>
                  </div>

                  <div className="space-y-3">
                    {asset.maintenances && asset.maintenances.length > 0 ? (
                      asset.maintenances.map((m) => (
                        <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 text-sm">{m.issue}</span>
                            <MaintenanceStatusBadge status={m.status} />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Assigned: <strong>{m.assignedTo}</strong></span>
                            <span>Action: {m.action}</span>
                            <span>Cost: <strong>₹{m.cost.toLocaleString('en-IN')}</strong></span>
                          </div>
                          {(m.beforePhotoUrl || m.afterPhotoUrl) && (
                            <button
                              onClick={() => onOpenEvidenceLightbox(m.beforePhotoUrl || undefined, m.afterPhotoUrl || undefined)}
                              className="text-xs text-indigo-600 hover:underline font-semibold"
                            >
                              📸 View Before & After Evidence
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-10">No maintenance work orders found.</div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => asset && onOpenEditAsset(asset)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
          >
            ✏️ Edit Asset Specs
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => asset && onOpenAddInspection(asset.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + New Inspection
            </button>
            <button
              onClick={() => asset && onOpenAddMaintenance(asset.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + Work Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
