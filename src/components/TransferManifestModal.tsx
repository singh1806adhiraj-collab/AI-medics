import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Truck,
  Snowflake,
  FileCheck,
  CheckCircle2,
  Building2,
  Calendar,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { TransferOpportunity, UserSession } from '../types';

interface TransferManifestModalProps {
  transfer: TransferOpportunity | null;
  session?: UserSession;
  onClose: () => void;
  onConfirmAuthorization: (
    transfer: TransferOpportunity,
    authorizedByName: string,
    authorizedRole: string
  ) => void;
}

export const TransferManifestModal: React.FC<TransferManifestModalProps> = ({
  transfer,
  session,
  onClose,
  onConfirmAuthorization,
}) => {
  const [adminName, setAdminName] = useState<string>(session?.name || 'Dr. Marcus Sterling, RPh');
  const [adminRole, setAdminRole] = useState<string>(session?.role || 'Director of Pharmacy Supply Chain');
  const [courierUnit, setCourierUnit] = useState('Metro Health Priority Courier #4');
  const [confirmedChecked, setConfirmedChecked] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const canAuthorize = session ? session.authenticated && session.hasDispatchAuthority : true;

  if (!transfer) return null;

  const manifestId = `MED-XFER-${transfer.fromHospitalId.replace('HOSP-', '')}-${transfer.toHospitalId.replace('HOSP-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const handleAuthorize = () => {
    if (!adminName.trim() || !adminRole.trim() || !confirmedChecked) return;
    setIsAuthorized(true);
    setTimeout(() => {
      onConfirmAuthorization(transfer, adminName, adminRole);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">
              Official Mutual-Aid Pharmaceutical Transfer Manifest
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manifest Body (Formatted Document) */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Document Header Watermark */}
          <div className="p-4 rounded-xl border border-teal-900/50 bg-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400">
                  HEALTHCARE RESILIENCE NETWORK
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                  DEMO DISPATCH — SYNTHETIC DATA
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-white mt-1">{manifestId}</div>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              <div>Timestamp: {timestamp}</div>
              <div>Urgency: <strong className="text-rose-400 uppercase">{transfer.urgency}</strong></div>
            </div>
          </div>

          {/* Facility Route Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Donor */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                Origin Facility (Surplus Donor)
              </div>
              <div className="font-bold text-white text-sm">{transfer.fromHospitalName}</div>
              <div className="text-slate-400 text-[11px]">
                Facility ID: {transfer.fromHospitalId}
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between text-[11px]">
                <span className="text-slate-400">Donor Pre-Transfer Runway:</span>
                <span className="text-slate-300 font-mono font-semibold">{transfer.donorPreBufferDays} days</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Donor Post-Transfer Runway:</span>
                <span className="text-teal-300 font-mono font-bold">{transfer.donorPostBufferDays} days (safe buffer)</span>
              </div>
            </div>

            {/* Destination Recipient */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                Destination Facility (Critical Shortage)
              </div>
              <div className="font-bold text-white text-sm">{transfer.toHospitalName}</div>
              <div className="text-slate-400 text-[11px]">
                Facility ID: {transfer.toHospitalId}
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between text-[11px]">
                <span className="text-slate-400">Recipient Pre-Transfer Runway:</span>
                <span className="text-rose-400 font-mono font-semibold">{transfer.recipientPreBufferDays} days</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Recipient Post-Transfer Runway:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {transfer.recipientPostBufferDays} days (+{transfer.impactDaysGained}d)
                </span>
              </div>
            </div>
          </div>

          {/* Pharmaceutical Cargo Specs */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Pharmaceutical Cargo & Logistics Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Medicine</span>
                <span className="font-bold text-white">{transfer.medicineName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Transfer Quantity</span>
                <span className="font-bold text-teal-400 text-sm">{transfer.recommendedQuantity} units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Transit Estimate</span>
                <span className="font-medium text-slate-200">{transfer.estTransitMinutes} mins ({transfer.distanceMiles} mi)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Expiry Units Saved</span>
                <span className={`font-bold ${transfer.expiryUnitsSaved > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {transfer.expiryUnitsSaved > 0 ? `${transfer.expiryUnitsSaved} units` : '0 (Safe)'}
                </span>
              </div>
            </div>
            {transfer.coldChain && (
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 flex items-center gap-2 text-xs">
                <Snowflake className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Validated Active Cold-Chain Courier Required (2°C - 8°C Monitored Box).</span>
              </div>
            )}
          </div>

          {/* Reason / Rationale Context */}
          <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-teal-400 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Algorithmic Matching Rationale</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">{transfer.rationale}</p>
          </div>

          {/* Administrator Human-in-the-Loop Sign-off Form */}
          <div className="p-4 rounded-xl border border-teal-800/60 bg-teal-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <h4 className="font-bold text-white text-xs">
                Hospital Pharmacy Logistics Authorization
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Authorizing Administrator Name *
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Administrator Role / Title *
                </label>
                <input
                  type="text"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Designated Priority Transport Courier / Driver Unit
              </label>
              <input
                type="text"
                value={courierUnit}
                onChange={(e) => setCourierUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Confirmation Checkbox */}
            {canAuthorize ? (
              <label className="flex items-start gap-2 pt-2 border-t border-teal-800/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedChecked}
                  onChange={(e) => setConfirmedChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-300">
                  I confirm this mutual-aid reallocation transfer has been reviewed, donor safety runway ({transfer.donorPostBufferDays}d) is verified, and priority chain-of-custody dispatch is authorized.
                </span>
              </label>
            ) : (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-start gap-2 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <strong>Role Permission Restriction:</strong> Your current session profile ({session?.role || 'Guest'}) does not have physical mutual-aid dispatch authority. Please switch to <em>Director of Pharmacy</em> or <em>Logistics Officer</em> in the User Profile menu to sign.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Manifest</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAuthorize}
              disabled={!canAuthorize || isAuthorized || !confirmedChecked || !adminName.trim() || !adminRole.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-900/40 cursor-pointer disabled:opacity-50"
            >
              {isAuthorized ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                  <span>Authorized & Dispatched</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>{!canAuthorize ? 'Authority Restricted' : 'Sign & Dispatch Transfer'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
