import React, { useEffect, useState } from 'react';
import { Inspection } from '../types/asset';
import { api } from '../services/api';
import { ConditionBadge, TypeBadge } from '../components/Badges';
import { ClipboardCheck, Plus, Calendar, User, Eye, Image as ImageIcon } from 'lucide-react';

interface InspectionsViewProps {
  onOpenAddInspection: (assetId?: string) => void;
  onOpenAssetPassport: (assetId: string) => void;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  onOpenAddInspection,
  onOpenAssetPassport,
}) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = () => {
    setLoading(true);
    api.getInspections()
      .then(setInspections)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Infrastructure Inspection Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">Field audit records, structural findings & recommended governance actions</p>
        </div>

        <button
          onClick={() => onOpenAddInspection()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> + Record New Field Inspection
        </button>
      </div>

      {/* Inspections List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading inspection records...</span>
          </div>
        ) : inspections.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-700">No inspection records found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                        {insp.asset?.assetCode}
                      </span>
                      {insp.asset?.assetType && <TypeBadge type={insp.asset.assetType} size="sm" />}
                      <ConditionBadge condition={insp.condition} size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-outfit">
                      {insp.asset?.name} ({insp.asset?.district})
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(insp.inspectionDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {insp.inspectorName}
                    </span>
                    <button
                      onClick={() => insp.assetId && onOpenAssetPassport(insp.assetId)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Passport
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Field Observations</span>
                    <p className="text-slate-800">"{insp.observations}"</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                    <span className="text-[10px] text-blue-700 uppercase tracking-wider font-bold">Recommended Action</span>
                    <p className="text-blue-900 font-semibold">{insp.recommendedAction}</p>
                  </div>
                </div>

                {insp.photoUrl && (
                  <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Inspection Photo Attached</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
