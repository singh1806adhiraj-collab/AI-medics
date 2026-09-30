import React from 'react';
import { AlertTriangle, ShieldCheck, Database, Info } from 'lucide-react';

export const SyntheticDataBanner: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-teal-400 font-medium bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded text-[11px]">
          <Database className="w-3 h-3 text-teal-400" />
          SYNTHETIC DEMONSTRATION DATA
        </span>
        <span className="hidden sm:inline text-slate-500">|</span>
        <span>
          Hospital operational metrics, batches, and patient consumption rates are synthetic for Hackathon demonstration.
        </span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <span className="inline-flex items-center gap-1 text-amber-400/90">
          <AlertTriangle className="w-3 h-3" />
          Administrative logistics only
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400 hidden md:inline">
          Not for clinical patient prescribing
        </span>
      </div>
    </div>
  );
};

export const OperationalSafetyNotice: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-start gap-3 ${className}`}>
      <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="font-medium text-slate-200 flex items-center gap-2">
          <span>Human-in-the-Loop Governance Protocol</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            Mandatory Sign-off
          </span>
        </div>
        <p className="leading-relaxed text-slate-400">
          All AI recommendations and automated transfer routes provide decision support only. Final physical drug redistribution dispatches require written authorization by the designated Hospital Pharmacy Logistics Director.
        </p>
      </div>
    </div>
  );
};
