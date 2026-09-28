import React, { useState, useEffect } from 'react';
import { Asset, Condition } from '../types/asset';
import { api } from '../services/api';
import { X, ClipboardCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewInspectionModalProps {
  isOpen: boolean;
  preSelectedAssetId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  preSelectedAssetId,
  onClose,
  onSuccess,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(preSelectedAssetId || '');
  const [inspectionDate, setInspectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState<string>('Er. Rajesh Patel (EE)');
  const [condition, setCondition] = useState<Condition>('CRITICAL');
  const [observations, setObservations] = useState<string>('Severe structural cracks and sub-base settlement observed during routine field audit.');
  const [recommendedAction, setRecommendedAction] = useState<string>('Immediate traffic restriction and full depth pavement rehabilitation.');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getAssets()
        .then((data) => {
          setAssets(data);
          if (!selectedAssetId && data.length > 0) {
            setSelectedAssetId(data[0].id);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (preSelectedAssetId) {
      setSelectedAssetId(preSelectedAssetId);
    }
  }, [preSelectedAssetId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createInspection({
        assetId: selectedAssetId,
        inspectionDate,
        inspectorName: inspectorName.trim(),
        condition,
        observations: observations.trim(),
        recommendedAction: recommendedAction.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Inspection submit error:', err);
      setError(err.message || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Record Field Inspection</h2>
              <p className="text-xs text-slate-500">Updates asset condition & triggers automated risk recalculation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Infrastructure Asset *</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} - {a.name} ({a.district})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inspection Date *</label>
              <input
                type="date"
                required
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inspector Officer Name *</label>
              <input
                type="text"
                required
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="e.g. Er. Alok Verma (SE)"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Assessed Condition *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['GOOD', 'MODERATE', 'POOR', 'CRITICAL'] as Condition[]).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`py-2 rounded-xl font-bold text-xs border transition ${
                    condition === cond
                      ? cond === 'CRITICAL'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : cond === 'POOR'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : cond === 'MODERATE'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Technical Observations & Findings *</label>
            <textarea
              required
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describe physical defects, cracks, rutting, spalling, or wear observed..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Recommended Engineering Action *</label>
            <input
              type="text"
              required
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="e.g. Full-depth reclamation and sub-grade stabilization within 30 days"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Site Inspection Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
            >
              {submitting ? 'Submitting...' : 'Save Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
