import React from 'react';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  Pill,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Hospital, InventoryRecord, Medicine, TransferOpportunity } from '../types';

interface CommandCenterProps {
  hospitals: Hospital[];
  medicines: Medicine[];
  inventory: InventoryRecord[];
  transferOpportunities: TransferOpportunity[];
  onAuthorizeTransfer: (opportunity: TransferOpportunity) => void;
  onNavigateToTab: (tab: 'inventory' | 'network' | 'simulator' | 'assistant') => void;
  onSelectHospitalFilter: (hospitalId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  hospitals,
  medicines,
  inventory,
  transferOpportunities,
  onAuthorizeTransfer,
  onNavigateToTab,
  onSelectHospitalFilter,
}) => {
  // Compute deterministic metrics
  const criticalItems = inventory.filter((i) => i.stockStatus === 'critical');
  const warningItems = inventory.filter((i) => i.stockStatus === 'warning');
  const stableItems = inventory.filter((i) => i.stockStatus === 'stable');
  const surplusItems = inventory.filter((i) => i.stockStatus === 'surplus');

  const totalExpiring30 = inventory.reduce((acc, curr) => acc + curr.unitsExpiring30Days, 0);

  // Hospitals facing at least one critical shortage
  const criticalHospitalIds = new Set(criticalItems.map((i) => i.hospitalId));
  const warningHospitalIds = new Set(warningItems.map((i) => i.hospitalId));

  // Urgent Actions (all critical items sorted by shortest runway)
  const urgentActions = [...criticalItems]
    .sort((a, b) => a.daysToStockout - b.daysToStockout)
    .slice(0, 5);

  const medicineMap = new Map(medicines.map((m) => [m.id, m]));
  const hospitalMap = new Map(hospitals.map((h) => [h.id, h]));

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Operational Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 p-6 md:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block mr-1"></span>
              Regional Healthcare Network Resilience Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hospital Supply Chain Command Center
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time multi-facility inventory telemetry, projected stockout risk modeling, and algorithmic mutual-aid redistribution across 10 network hospitals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('assistant')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-medium text-xs shadow-lg shadow-teal-900/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Operations Assistant</span>
            </button>
            <button
              onClick={() => onNavigateToTab('network')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium text-xs transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>View Transfer Network ({transferOpportunities.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Hospitals */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Hospitals Monitored</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{hospitals.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {criticalHospitalIds.size} at immediate risk
            </div>
          </div>
        </div>

        {/* Medicines Monitored */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Medicines Monitored</span>
            <Pill className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{medicines.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              6 critical therapeutic classes
            </div>
          </div>
        </div>

        {/* Critical Shortages */}
        <div className="p-4 rounded-xl border border-rose-900/40 bg-gradient-to-br from-rose-950/30 to-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-300 text-xs font-semibold">
            <span>Critical Shortages</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400">{criticalItems.length}</div>
            <div className="text-[11px] text-rose-300/80 mt-1">
              &lt; 3.5 days safety buffer
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="p-4 rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
            <span>Stock Warnings</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-300">{warningItems.length}</div>
            <div className="text-[11px] text-amber-400/80 mt-1">
              3 - 7 days buffer remaining
            </div>
          </div>
        </div>

        {/* Stable Inventory */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400/90 text-xs font-medium">
            <span>Stable Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400">{stableItems.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              &gt; 7 days robust buffer
            </div>
          </div>
        </div>

        {/* Expiry / Waste Risk */}
        <div className="p-4 rounded-xl border border-cyan-900/40 bg-gradient-to-br from-cyan-950/20 to-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-medium">
            <span>Imminent Expiry (&lt;30d)</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-cyan-300">{totalExpiring30.toLocaleString()}</div>
            <div className="text-[11px] text-cyan-400/80 mt-1">
              Units eligible for re-routing
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Immediate Operational Interventions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Facilities facing stock depletion within 48 to 72 hours. Matched with donor surplus for rapid dispatch.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('network')}
            className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Reallocation Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentActions.map((rec) => {
            const med = medicineMap.get(rec.medicineId);
            const hosp = hospitalMap.get(rec.hospitalId);
            if (!med || !hosp) return null;

            // Find matching transfer opportunity if any
            const matchedOpp = transferOpportunities.find(
              (o) => o.toHospitalId === hosp.id && o.medicineId === med.id
            );

            const hoursRemaining = Math.max(1, Math.round(rec.daysToStockout * 24));
            const progressPercent = Math.min(100, Math.max(8, (rec.daysToStockout / med.criticalBufferDays) * 100));

            return (
              <div
                key={rec.id}
                className="p-5 rounded-xl border border-rose-900/50 bg-slate-900/70 hover:border-rose-700/60 transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
                          CRITICAL SHORTAGE
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-400">{hosp.facilityType}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{med.name}</h3>
                      <p className="text-xs text-slate-300 font-medium">{hosp.name}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-rose-400">
                        {rec.daysToStockout} <span className="text-xs font-normal text-rose-300">days</span>
                      </div>
                      <div className="text-[11px] text-rose-300 font-mono">
                        ~{hoursRemaining}h to stockout
                      </div>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        Current On-Hand: <strong className="text-white">{rec.currentStock}</strong> {med.standardUnit}
                      </span>
                      <span>
                        Daily Burn: <strong className="text-white">{rec.averageDailyConsumption}</strong> {med.standardUnit}/day
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Algorithmic Recommendation Context */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-teal-400 font-medium mb-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Algorithmic Reallocation Match</span>
                      <span className="text-slate-500 font-normal">·</span>
                      <span className="text-[11px] text-teal-300 font-mono">
                        {matchedOpp ? `Matching Score: ${matchedOpp.donorScore}/100` : 'Deterministic'}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {matchedOpp
                        ? `${matchedOpp.fromHospitalName} can dispatch ${matchedOpp.recommendedQuantity} ${med.standardUnit}. Recipient runway expands from ${matchedOpp.recipientPreBufferDays}d to ${matchedOpp.recipientPostBufferDays}d (+${matchedOpp.impactDaysGained}d). Donor retains ${matchedOpp.donorPostBufferDays}d buffer. Transit: ${matchedOpp.estTransitMinutes}m.`
                        : rec.algorithmicRecommendation}
                    </p>
                  </div>
                </div>

                {/* Working Action Row */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Lead: {hosp.logisticsLead}
                  </span>
                  {matchedOpp ? (
                    <button
                      onClick={() => onAuthorizeTransfer(matchedOpp)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Authorize Mutual Transfer</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateToTab('inventory')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Inspect Inventory
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Network Health Heatmap Summary */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Regional Facility Stock Health Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current inventory posture across all 10 network hospitals. Click a facility to inspect or filter inventory.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (&lt;3.5d)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning (3-7d)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stable (&gt;7d)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Surplus (&gt;21d)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {hospitals.map((hosp) => {
            const hospRecords = inventory.filter((i) => i.hospitalId === hosp.id);
            const crit = hospRecords.filter((i) => i.stockStatus === 'critical').length;
            const warn = hospRecords.filter((i) => i.stockStatus === 'warning').length;
            const surp = hospRecords.filter((i) => i.stockStatus === 'surplus').length;

            return (
              <div
                key={hosp.id}
                onClick={() => {
                  onSelectHospitalFilter(hosp.id);
                  onNavigateToTab('inventory');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  crit > 0
                    ? 'border-rose-900/60 bg-rose-950/15 hover:border-rose-600'
                    : warn > 0
                    ? 'border-amber-900/50 bg-amber-950/10 hover:border-amber-600'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">{hosp.region}</span>
                  <span className="text-[10px] text-slate-400">{hosp.facilityType}</span>
                </div>
                <div className="font-semibold text-white text-sm mt-1 truncate" title={hosp.name}>
                  {hosp.name}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {crit > 0 && (
                      <span className="text-rose-400 font-semibold">{crit} crit</span>
                    )}
                    {warn > 0 && (
                      <span className="text-amber-400 font-medium">{warn} warn</span>
                    )}
                    {crit === 0 && warn === 0 && (
                      <span className="text-emerald-400 font-medium">All stable</span>
                    )}
                  </div>
                  {surp > 0 && (
                    <span className="text-cyan-400 text-[11px] font-mono">+{surp} surplus</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
