import React, { useState, useEffect } from 'react';
import { Maintenance, MaintenanceStatus } from '../types/asset';
import { api } from '../services/api';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpdateMaintenanceModalProps {
  maintenance: Maintenance | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateMaintenanceModal: React.FC<UpdateMaintenanceModalProps> = ({
  maintenance,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<MaintenanceStatus>('IN_PROGRESS');
  const [cost, setCost] = useState<string>('');
  const [actualCompletionDate, setActualCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (maintenance) {
      setStatus(maintenance.status);
      setCost(maintenance.cost.toString());
      if (maintenance.afterPhotoUrl) {
        setAfterPhotoUrl(maintenance.afterPhotoUrl);
      }
    }
  }, [maintenance]);

  if (!maintenance) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.updateMaintenance(maintenance.id, {
        status,
        cost: parseFloat(cost) || maintenance.cost,
        actualCompletionDate: status === 'COMPLETED' ? actualCompletionDate : undefined,
        afterPhotoUrl: afterPhotoUrl.trim() || undefined,
      });

      if (status === 'COMPLETED') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Update maintenance error:', err);
      setError(err.message || 'Failed to update work order status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-outfit">Update Maintenance Work Order</h2>
            <p className="text-xs text-slate-500">Order ID: {maintenance.id.substring(0, 8)} • Asset: {maintenance.asset?.assetCode}</p>
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

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Issue Description</span>
            <p className="text-sm font-semibold text-slate-900">{maintenance.issue}</p>
            <div className="text-[11px] text-slate-500">Assigned: {maintenance.assignedTo}</div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Update Status *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as MaintenanceStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 rounded-xl font-bold text-[11px] border transition ${
                    status === st
                      ? st === 'COMPLETED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : st === 'IN_PROGRESS'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : st === 'ASSIGNED'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Final / Revised Cost (₹)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {status === 'COMPLETED' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Actual Completion Date</label>
                <input
                  type="date"
                  value={actualCompletionDate}
                  onChange={(e) => setActualCompletionDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">After Repair Photo Evidence URL</label>
            <input
              type="text"
              value={afterPhotoUrl}
              onChange={(e) => setAfterPhotoUrl(e.target.value)}
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
              {submitting ? 'Updating...' : 'Save & Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
