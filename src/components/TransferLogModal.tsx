import React from 'react';
import { X, FileSpreadsheet, CheckCircle2, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { TransferLog } from '../types';

interface TransferLogModalProps {
  logs: TransferLog[];
  isOpen: boolean;
  onClose: () => void;
}

export const TransferLogModal: React.FC<TransferLogModalProps> = ({ logs, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">
              Mutual-Aid Transfer Audit Log & Manifest History ({logs.length} Records)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype synthetic notice */}
        <div className="px-6 py-2 bg-amber-950/20 border-b border-amber-900/30 text-[11px] text-amber-300/90 flex items-center justify-between">
          <span className="font-mono font-bold text-[10px]">
            DEMO DISPATCH — SYNTHETIC DATA
          </span>
          <span className="text-slate-400">
            Chain-of-custody simulation for Hackathon demonstration
          </span>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No inter-hospital transfers have been authorized in this session yet. Explore the Command Center or Resource Network to authorize a mutual-aid transfer.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-400 font-bold">{log.transferId}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> {log.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Timestamp: {log.timestamp}
                    </div>
                  </div>

                  {/* Route & Cargo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {log.quantity} units · {log.medicineName}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 mt-1">
                        <span>{log.fromHospital}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-rose-300 font-semibold">{log.toHospital}</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                      <div>Transit Est: {log.transitMinutes} mins</div>
                      <div>Expiry Saved: {log.expiryUnitsSaved} units</div>
                    </div>
                  </div>

                  {/* Runway Before vs After */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Donor Pre-Transfer:</span>
                      <span className="text-slate-200">{log.preDonorRunway}d runway</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Donor Post-Transfer:</span>
                      <span className="text-teal-400 font-bold">{log.postDonorRunway}d safe</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Recipient Pre-Transfer:</span>
                      <span className="text-rose-400">{log.preRecipientRunway}d critical</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Recipient Post-Transfer:</span>
                      <span className="text-cyan-300 font-bold">{log.postRecipientRunway}d runway</span>
                    </div>
                  </div>

                  {/* Sign-off & Reason */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                    <p className="line-clamp-1 text-slate-300 flex-1">
                      Reason: {log.notes}
                    </p>
                    <div className="shrink-0 font-medium">
                      Authorized by: <strong className="text-slate-200">{log.authorizedBy}</strong> ({log.approverRole})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
