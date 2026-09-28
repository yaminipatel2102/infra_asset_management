import React, { useState, useEffect } from 'react';
import { Asset, MaintenancePriority, MaintenanceStatus } from '../types/asset';
import { api } from '../services/api';
import { X, Wrench, AlertCircle } from 'lucide-react';

interface NewMaintenanceModalProps {
  isOpen: boolean;
  preSelectedAssetId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewMaintenanceModal: React.FC<NewMaintenanceModalProps> = ({
  isOpen,
  preSelectedAssetId,
  onClose,
  onSuccess,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(preSelectedAssetId || '');
  const [issue, setIssue] = useState<string>('Severe sub-base settlement and structural cracks');
  const [priority, setPriority] = useState<MaintenancePriority>('HIGH');
  const [action, setAction] = useState<string>('Full-depth pavement reclamation and micro-surfacing');
  const [assignedTo, setAssignedTo] = useState<string>('Gujarat State Highway Contractors Ltd.');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState<string>('2026-11-30');
  const [cost, setCost] = useState<string>('1850000');
  const [status, setStatus] = useState<MaintenanceStatus>('ASSIGNED');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string>('https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80');

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
        .catch(console.error);
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
      await api.createMaintenance({
        assetId: selectedAssetId,
        issue: issue.trim(),
        priority,
        action: action.trim(),
        assignedTo: assignedTo.trim(),
        expectedCompletionDate,
        cost: parseFloat(cost) || 0,
        status,
        beforePhotoUrl: beforePhotoUrl.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Maintenance error:', err);
      setError(err.message || 'Failed to issue work order');
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
            <Wrench className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Issue Maintenance Work Order</h2>
              <p className="text-xs text-slate-500">Assigns contractor & tracks repair lifecycle</p>
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

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Issue Description *</label>
            <input
              type="text"
              required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe defect or maintenance requirement..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Required Action / Work Scope *</label>
            <textarea
              required
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Scope of works to be executed..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Agency / Contractor *</label>
              <input
                type="text"
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Contractor or R&B Wing..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estimated Cost (₹) *</label>
              <input
                type="number"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Expected Completion Date</label>
            <input
              type="date"
              value={expectedCompletionDate}
              onChange={(e) => setExpectedCompletionDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Before Repair Photo URL (Evidence)</label>
            <input
              type="text"
              value={beforePhotoUrl}
              onChange={(e) => setBeforePhotoUrl(e.target.value)}
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
            >
              {submitting ? 'Creating Order...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
