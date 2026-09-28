import React from 'react';
import { X, ArrowRight, ShieldCheck, Camera } from 'lucide-react';

interface EvidenceLightboxProps {
  isOpen: boolean;
  beforeUrl?: string;
  afterUrl?: string;
  onClose: () => void;
}

export const EvidenceLightboxModal: React.FC<EvidenceLightboxProps> = ({
  isOpen,
  beforeUrl,
  afterUrl,
  onClose,
}) => {
  if (!isOpen) return null;

  const defaultBefore = 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80';
  const defaultAfter = 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80';

  const beforeImg = beforeUrl || defaultBefore;
  const afterImg = afterUrl || defaultAfter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Maintenance Photo Evidence Verification</h2>
              <p className="text-xs text-slate-500">Before & After Repair Visual Auditing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side Images */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          {/* BEFORE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                BEFORE REPAIR EVIDENCE
              </span>
              <span className="text-[11px] text-slate-500">Pre-maintenance Inspection</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 relative shadow-sm">
              <img src={beforeImg} alt="Before repair" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[10px] text-slate-700 font-mono shadow-sm border border-slate-200">
                Initial Condition Damage
              </div>
            </div>
          </div>

          {/* AFTER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AFTER REPAIR COMPLETED
              </span>
              <span className="text-[11px] text-slate-500">Contractor Verification</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 relative shadow-sm">
              <img src={afterImg} alt="After repair" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[10px] text-emerald-700 font-mono font-bold shadow-sm border border-emerald-200">
                Restored & Rectified
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Close Audit Preview
          </button>
        </div>
      </div>
    </div>
  );
};
