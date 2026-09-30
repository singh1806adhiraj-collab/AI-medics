import React, { useState, useMemo } from 'react';
import {
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Snowflake,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  MapPin,
} from 'lucide-react';
import { Hospital, InventoryRecord, Medicine, TransferOpportunity } from '../types';

interface ResourceNetworkProps {
  hospitals: Hospital[];
  medicines: Medicine[];
  inventory: InventoryRecord[];
  transferOpportunities: TransferOpportunity[];
  onAuthorizeTransfer: (opportunity: TransferOpportunity) => void;
  onOpenManifestModal: (transfer: TransferOpportunity) => void;
}

export const ResourceNetwork: React.FC<ResourceNetworkProps> = ({
  hospitals,
  medicines,
  inventory,
  transferOpportunities,
  onAuthorizeTransfer,
  onOpenManifestModal,
}) => {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('all');
  const [activeHospitalId, setActiveHospitalId] = useState<string | null>(null);

  const medicineMap = useMemo(() => new Map(medicines.map((m) => [m.id, m])), [medicines]);
  const hospitalMap = useMemo(() => new Map(hospitals.map((h) => [h.id, h])), [hospitals]);

  // Filter transfer opportunities based on selected medicine
  const visibleOpportunities = useMemo(() => {
    if (selectedMedicineId === 'all') return transferOpportunities;
    return transferOpportunities.filter((o) => o.medicineId === selectedMedicineId);
  }, [transferOpportunities, selectedMedicineId]);

  // Node health status for each hospital
  const hospitalNodeStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        criticalCount: number;
        warningCount: number;
        surplusCount: number;
        selectedMedStock?: number;
        selectedMedDays?: number;
        selectedMedStatus?: string;
      }
    >();

    for (const h of hospitals) {
      const records = inventory.filter((i) => i.hospitalId === h.id);
      const crit = records.filter((i) => i.stockStatus === 'critical').length;
      const warn = records.filter((i) => i.stockStatus === 'warning').length;
      const surp = records.filter((i) => i.stockStatus === 'surplus').length;

      let medStock: number | undefined;
      let medDays: number | undefined;
      let medStatus: string | undefined;

      if (selectedMedicineId !== 'all') {
        const sel = records.find((i) => i.medicineId === selectedMedicineId);
        if (sel) {
          medStock = sel.currentStock;
          medDays = sel.daysToStockout;
          medStatus = sel.stockStatus;
        }
      }

      stats.set(h.id, {
        criticalCount: crit,
        warningCount: warn,
        surplusCount: surp,
        selectedMedStock: medStock,
        selectedMedDays: medDays,
        selectedMedStatus: medStatus,
      });
    }

    return stats;
  }, [hospitals, inventory, selectedMedicineId]);

  // Selected hospital details
  const activeHospital = activeHospitalId ? hospitalMap.get(activeHospitalId) : null;
  const activeHospitalInventory = activeHospitalId
    ? inventory.filter((i) => i.hospitalId === activeHospitalId)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Resource Redistribution Network</span>
            <span className="text-xs font-normal text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded-full">
              {visibleOpportunities.length} Active Transfer Routes
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Spatial topology graph of regional hospital facilities with automated cross-docking and mutual-aid transfer corridors.
          </p>
        </div>

        {/* Medicine Selector for Focused Network Visualization */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Focus Medicine:</span>
          <select
            value={selectedMedicineId}
            onChange={(e) => setSelectedMedicineId(e.target.value)}
            aria-label="Filter network visualization by medicine"
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="all">All Medicines (Network Multi-Hop View)</option>
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left interactive spatial diagram, Right transfer dispatch panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Spatial Network Canvas */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">Regional Healthcare Logistics Grid</span>
            </div>
            <span className="text-[11px] text-slate-400">Click a facility node to inspect dossier</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {/* Subtle background coordinate grid */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Region Label Watermarks */}
            <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
              North County
            </div>
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
              West Foothills
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
              East Valley
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
              South Bay
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
              Metro Core
            </div>

            {/* SVG Routes and Nodes */}
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
              <defs>
                {/* Arrowhead marker */}
                <marker
                  id="arrowhead-cyan"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#06b6d4" />
                </marker>
                <marker
                  id="arrowhead-rose"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
                </marker>
                {/* Glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Passive Gray Transit Corridors between all nearby hospitals */}
              <g stroke="#334155" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.6">
                <line x1="48" y1="52" x2="58" y2="28" />
                <line x1="48" y1="52" x2="74" y2="64" />
                <line x1="48" y1="52" x2="42" y2="46" />
                <line x1="48" y1="52" x2="52" y2="88" />
                <line x1="58" y1="28" x2="64" y2="14" />
                <line x1="74" y1="64" x2="82" y2="78" />
                <line x1="42" y1="46" x2="26" y2="36" />
                <line x1="26" y1="36" x2="18" y2="22" />
                <line x1="52" y1="88" x2="44" y2="76" />
              </g>

              {/* Active Transfer Arc Lines */}
              {visibleOpportunities.map((opp) => {
                const donor = hospitalMap.get(opp.fromHospitalId);
                const recipient = hospitalMap.get(opp.toHospitalId);
                if (!donor || !recipient) return null;

                // Create a slight curve by calculating perpendicular midpoint
                const midX = (donor.coordinates.x + recipient.coordinates.x) / 2;
                const midY = (donor.coordinates.y + recipient.coordinates.y) / 2;
                const dx = recipient.coordinates.x - donor.coordinates.x;
                const dy = recipient.coordinates.y - donor.coordinates.y;
                const curveOffset = 6;
                const ctrlX = midX - (dy / 50) * curveOffset;
                const ctrlY = midY + (dx / 50) * curveOffset;

                const isImmediate = opp.urgency === 'immediate';

                return (
                  <g key={opp.id} className="cursor-pointer">
                    {/* Shadow / Glow Line */}
                    <path
                      d={`M ${donor.coordinates.x} ${donor.coordinates.y} Q ${ctrlX} ${ctrlY} ${recipient.coordinates.x} ${recipient.coordinates.y}`}
                      fill="none"
                      stroke={isImmediate ? '#f43f5e' : '#06b6d4'}
                      strokeWidth="1.2"
                      strokeOpacity="0.4"
                      filter="url(#glow)"
                    />
                    {/* Pulsing Animated Route */}
                    <path
                      d={`M ${donor.coordinates.x} ${donor.coordinates.y} Q ${ctrlX} ${ctrlY} ${recipient.coordinates.x} ${recipient.coordinates.y}`}
                      fill="none"
                      stroke={isImmediate ? '#f43f5e' : '#06b6d4'}
                      strokeWidth="0.8"
                      strokeDasharray="2 1.5"
                      markerEnd={isImmediate ? 'url(#arrowhead-rose)' : 'url(#arrowhead-cyan)'}
                      className="animate-[dash_1s_linear_infinite]"
                    />
                  </g>
                );
              })}

              {/* Hospital Nodes */}
              {hospitals.map((hosp) => {
                const stats = hospitalNodeStats.get(hosp.id);
                const isSelected = activeHospitalId === hosp.id;

                let nodeColor = '#10b981'; // default emerald
                let pingColor = 'none';

                if (selectedMedicineId !== 'all' && stats?.selectedMedStatus) {
                  if (stats.selectedMedStatus === 'critical') {
                    nodeColor = '#f43f5e';
                    pingColor = '#f43f5e';
                  } else if (stats.selectedMedStatus === 'warning') {
                    nodeColor = '#f59e0b';
                  } else if (stats.selectedMedStatus === 'surplus') {
                    nodeColor = '#06b6d4';
                  }
                } else {
                  if (stats && stats.criticalCount > 0) {
                    nodeColor = '#f43f5e';
                    pingColor = '#f43f5e';
                  } else if (stats && stats.warningCount > 0) {
                    nodeColor = '#f59e0b';
                  } else if (stats && stats.surplusCount > 2) {
                    nodeColor = '#06b6d4';
                  }
                }

                return (
                  <g
                    key={hosp.id}
                    onClick={() => setActiveHospitalId(isSelected ? null : hosp.id)}
                    className="cursor-pointer group"
                  >
                    {/* Ping ring for critical */}
                    {pingColor !== 'none' && (
                      <circle
                        cx={hosp.coordinates.x}
                        cy={hosp.coordinates.y}
                        r="4"
                        fill="none"
                        stroke={pingColor}
                        strokeWidth="0.5"
                        opacity="0.7"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Selection Highlight */}
                    {isSelected && (
                      <circle
                        cx={hosp.coordinates.x}
                        cy={hosp.coordinates.y}
                        r="4.2"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={hosp.coordinates.x}
                      cy={hosp.coordinates.y}
                      r={hosp.facilityType.includes('Trauma') || hosp.totalBeds > 600 ? '3.2' : '2.5'}
                      fill="#0f172a"
                      stroke={nodeColor}
                      strokeWidth="1"
                      className="group-hover:scale-125 transition-transform origin-center"
                    />

                    {/* Center Core Dot */}
                    <circle
                      cx={hosp.coordinates.x}
                      cy={hosp.coordinates.y}
                      r="1"
                      fill={nodeColor}
                    />

                    {/* Facility Short Name Label */}
                    <text
                      x={hosp.coordinates.x}
                      y={hosp.coordinates.y + 4.5}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="2.4"
                      fontWeight="500"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {hosp.shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Shortage Recipient
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Surplus Donor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stable Posture
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-cyan-400 border-dashed"></span>
              <span className="text-cyan-300 font-mono">Mutual-Aid Transfer Corridor</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Hospital Dossier & Transfer Opportunities */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hospital Dossier Card if clicked */}
          {activeHospital ? (
            <div className="p-4 rounded-xl border border-teal-800/60 bg-slate-900/90 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
                    {activeHospital.facilityType} · {activeHospital.region}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{activeHospital.name}</h3>
                </div>
                <button
                  onClick={() => setActiveHospitalId(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total / ICU Beds</span>
                  <span className="font-semibold text-white">
                    {activeHospital.totalBeds} / {activeHospital.icuBeds} beds
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Logistics Lead</span>
                  <span className="font-medium text-teal-300 truncate block">
                    {activeHospital.logisticsLead}
                  </span>
                </div>
              </div>

              {/* Critical needs at this hospital */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300">
                  Critical Vulnerabilities ({activeHospitalInventory.filter((i) => i.stockStatus === 'critical').length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHospitalInventory
                    .filter((i) => i.stockStatus === 'critical')
                    .map((item) => {
                      const m = medicineMap.get(item.medicineId);
                      return (
                        <span
                          key={item.id}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60"
                        >
                          {m?.name} ({item.daysToStockout}d)
                        </span>
                      );
                    })}
                  {activeHospitalInventory.filter((i) => i.stockStatus === 'critical').length === 0 && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> No active critical shortages
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Transfer Opportunities List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Recommended Redistribution Transfers</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {visibleOpportunities.length} routes calculated
              </span>
            </div>

            {visibleOpportunities.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-400">
                No active transfer opportunities for the selected filter. Inventory is currently balanced.
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 no-scrollbar">
                {visibleOpportunities.map((opp) => {
                  const donor = hospitalMap.get(opp.fromHospitalId);
                  const recipient = hospitalMap.get(opp.toHospitalId);
                  const med = medicineMap.get(opp.medicineId);

                  const isImmediate = opp.urgency === 'immediate';

                  return (
                    <div
                      key={opp.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isImmediate
                          ? 'border-rose-900/60 bg-gradient-to-br from-rose-950/20 to-slate-900/90'
                          : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            {isImmediate ? (
                              <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-950/80 border border-rose-800/80 px-1.5 py-0.2 rounded">
                                Immediate Urgent
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold uppercase text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-1.5 py-0.2 rounded">
                                High Priority
                              </span>
                            )}
                            <span className="text-slate-500">·</span>
                            <span className="text-xs text-slate-300 font-bold">{opp.medicineName}</span>
                          </div>
                        </div>

                        {opp.coldChain && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.2 rounded"
                            title="Validated Active Cold-Chain Courier Required (2-8°C)"
                          >
                            <Snowflake className="w-3 h-3" />
                            Cold Chain
                          </span>
                        )}
                      </div>

                      {/* Route Display: Donor -> Recipient */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">Surplus Donor:</span>
                          <span className="font-semibold text-slate-200">
                            {donor?.shortName || opp.fromHospitalName}
                          </span>
                        </div>
                        <div className="flex flex-col items-center px-2">
                          <span className="text-[10px] font-mono text-cyan-400">
                            {opp.estTransitMinutes} mins · {opp.distanceMiles} mi
                          </span>
                          <ArrowRight className="w-4 h-4 text-cyan-400 my-0.5" />
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-[10px] text-slate-400 block">Critical Recipient:</span>
                          <span className="font-semibold text-rose-300">
                            {recipient?.shortName || opp.toHospitalName}
                          </span>
                        </div>
                      </div>

                      {/* Transfer Impact Stats Grid */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Transfer Quantity:</span>
                          <span className="font-bold text-white">
                            {opp.recommendedQuantity} {med?.standardUnit}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Donor Runway After:</span>
                          <span className="font-bold text-teal-400">
                            {opp.donorPostBufferDays} days ({opp.donorPreBufferDays}d before)
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Recipient Runway After:</span>
                          <span className="font-bold text-cyan-300">
                            {opp.recipientPostBufferDays} days ({opp.recipientPreBufferDays}d before)
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Expiry Units Saved:</span>
                          <span className={`font-bold ${opp.expiryUnitsSaved > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {opp.expiryUnitsSaved > 0 ? `${opp.expiryUnitsSaved} units` : '0 (Safe)'}
                          </span>
                        </div>
                      </div>

                      {/* Matching Score Breakdown & Rationale */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-teal-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Algorithmic Matching Score: {opp.donorScore}/100</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Transit: {opp.estTransitMinutes} mins · {opp.distanceMiles} mi
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {opp.rationale}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onOpenManifestModal(opp)}
                          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                          <span>View Manifest</span>
                        </button>

                        <button
                          onClick={() => onAuthorizeTransfer(opp)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Authorize & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
