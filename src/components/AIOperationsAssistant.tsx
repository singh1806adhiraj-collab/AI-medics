import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Terminal,
  Truck,
  Layers,
  ArrowRight,
  Database,
  Calendar,
} from 'lucide-react';
import {
  Hospital,
  InventoryRecord,
  Medicine,
  TransferOpportunity,
  StructuredAnalysisResult,
  CustomQueryResult,
} from '../types';

interface AIOperationsAssistantProps {
  hospitals: Hospital[];
  medicines: Medicine[];
  inventory: InventoryRecord[];
  transferOpportunities: TransferOpportunity[];
}

export const AIOperationsAssistant: React.FC<AIOperationsAssistantProps> = ({
  hospitals,
  medicines,
  inventory,
  transferOpportunities,
}) => {
  const [customQuery, setCustomQuery] = useState(
    'Which hospitals can safely supply Metropolitan General Hospital with Norepinephrine while maintaining their own safety buffer?'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStateText, setLoadingStateText] = useState('');
  const [activeAnalysisName, setActiveAnalysisName] = useState<string>('');
  const [structuredAnalysis, setStructuredAnalysis] = useState<StructuredAnalysisResult | null>(null);
  const [customQueryResult, setCustomQueryResult] = useState<CustomQueryResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const medicineMap = new Map(medicines.map((m) => [m.id, m]));
  const hospitalMap = new Map(hospitals.map((h) => [h.id, h]));

  const PRESET_QUERIES = [
    {
      id: 'critical_deepdive',
      title: 'Regional Critical Shortage Deep-Dive',
      description: 'Audit all <3.5 day buffers and evaluate priority mutual-aid dispatch urgency.',
    },
    {
      id: 'waste_mitigation',
      title: 'Pharmaceutical Waste Mitigation Strategy',
      description: 'Analyze <30d expiring batches at Valley Med & Highland to reallocate before write-off.',
    },
    {
      id: 'cold_chain_protocol',
      title: 'Cold-Chain Redistribution Logistics Protocol',
      description: 'Audit 2°C - 8°C handling specs for Regular Insulin & Succinylcholine transport.',
    },
    {
      id: 'donor_capacity_audit',
      title: 'Fair Multi-Hospital Donor Capacity Audit',
      description: 'Verify donor hospitals preserve at least 14 days safety buffer post-transfer.',
    },
  ];

  // Build minimal, high-signal structured telemetry context
  const buildRelevantTelemetry = (actionType: string) => {
    const criticalItems = inventory
      .filter((i) => i.stockStatus === 'critical')
      .map((i) => {
        const m = medicineMap.get(i.medicineId);
        const h = hospitalMap.get(i.hospitalId);
        return {
          hospital: h?.name,
          facilityType: h?.facilityType,
          medicine: m?.name,
          category: m?.category,
          currentStock: i.currentStock,
          dailyBurn: i.averageDailyConsumption,
          daysToStockout: i.daysToStockout,
          trend: `${i.trendPercent > 0 ? '+' : ''}${i.trendPercent}%`,
          coldChain: m?.coldChainRequired,
        };
      });

    const donorCandidates = inventory
      .filter((i) => i.stockStatus === 'surplus' || i.daysToStockout > 16)
      .map((i) => {
        const m = medicineMap.get(i.medicineId);
        const h = hospitalMap.get(i.hospitalId);
        return {
          hospital: h?.name,
          medicine: m?.name,
          currentStock: i.currentStock,
          dailyBurn: i.averageDailyConsumption,
          daysToStockout: i.daysToStockout,
          expiring30DaysUnits: i.unitsExpiring30Days,
          minimumSafetyStock14Days: Math.ceil(i.averageDailyConsumption * 14),
          availableToDonate: Math.max(0, i.currentStock - Math.ceil(i.averageDailyConsumption * 14)),
        };
      });

    const expiringBatches = inventory
      .filter((i) => i.unitsExpiring30Days > 0)
      .map((i) => {
        const m = medicineMap.get(i.medicineId);
        const h = hospitalMap.get(i.hospitalId);
        return {
          hospital: h?.name,
          medicine: m?.name,
          expiringUnits: i.unitsExpiring30Days,
          totalStock: i.currentStock,
          daysRunway: i.daysToStockout,
        };
      });

    const activeRoutes = transferOpportunities.map((o) => ({
      from: o.fromHospitalName,
      to: o.toHospitalName,
      medicine: o.medicineName,
      quantity: o.recommendedQuantity,
      transitMinutes: o.estTransitMinutes,
      distanceMiles: o.distanceMiles,
      recipientRunwayBefore: o.recipientPreBufferDays,
      recipientRunwayAfter: o.recipientPostBufferDays,
      donorRunwayAfter: o.donorPostBufferDays,
      expiryUnitsSaved: o.expiryUnitsSaved,
      score: o.donorScore,
      urgency: o.urgency,
    }));

    return {
      action: actionType,
      network_overview: {
        total_hospitals: hospitals.length,
        total_medicines: medicines.length,
        critical_shortage_count: criticalItems.length,
      },
      critical_items: criticalItems,
      donor_candidates: donorCandidates,
      expiring_batches: expiringBatches,
      algorithmic_transfer_routes: activeRoutes,
    };
  };

  // Execute one of the 4 structured actions with real Gemini API
  const handleExecutePreset = async (actionTitle: string) => {
    setIsLoading(true);
    setLoadingStateText('Gemini analyzing operational state...');
    setActiveAnalysisName(actionTitle);
    setStructuredAnalysis(null);
    setCustomQueryResult(null);
    setErrorNotice(null);

    const telemetry = buildRelevantTelemetry(actionTitle);

    try {
      const res = await fetch('/api/gemini/analyze-structured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: actionTitle,
          telemetry,
        }),
      });

      const data = await res.json();
      if (res.ok && data.summary) {
        setStructuredAnalysis(data);
      } else {
        setErrorNotice(data.message || 'Gemini analysis unavailable — deterministic analysis remains available.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotice('Gemini analysis unavailable — deterministic analysis remains available.');
    } finally {
      setIsLoading(false);
      setLoadingStateText('');
    }
  };

  // Execute custom question with real Gemini API
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim() || isLoading) return;

    setIsLoading(true);
    setLoadingStateText('Generating redistribution strategy...');
    setActiveAnalysisName('Custom Operational Query');
    setStructuredAnalysis(null);
    setCustomQueryResult(null);
    setErrorNotice(null);

    // Extract relevant medicine from user question if mentioned
    const lowerQuery = customQuery.toLowerCase();
    let relevantMeds = medicines.filter(
      (m) =>
        lowerQuery.includes(m.name.toLowerCase()) ||
        lowerQuery.includes(m.genericName.toLowerCase()) ||
        (m.id === 'MED-01' && lowerQuery.includes('norepinephrine'))
    );
    if (relevantMeds.length === 0) {
      relevantMeds = medicines;
    }

    const relevantMedIds = new Set(relevantMeds.map((m) => m.id));

    // Send only relevant subset of records
    const contextData = inventory
      .filter((i) => relevantMedIds.has(i.medicineId))
      .map((i) => {
        const m = medicineMap.get(i.medicineId);
        const h = hospitalMap.get(i.hospitalId);
        return {
          hospital: h?.name,
          region: h?.region,
          facilityType: h?.facilityType,
          medicine: m?.name,
          currentStock: i.currentStock,
          dailyBurn: i.averageDailyConsumption,
          stockRunwayDays: i.daysToStockout,
          status: i.stockStatus,
          expiring30DaysUnits: i.unitsExpiring30Days,
          minimumSafetyReserve14Days: Math.ceil(i.averageDailyConsumption * 14),
          availableSurplusOverSafeBuffer: Math.max(0, i.currentStock - Math.ceil(i.averageDailyConsumption * 14)),
        };
      });

    try {
      const res = await fetch('/api/gemini/custom-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: customQuery,
          contextData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setCustomQueryResult(data);
      } else {
        setErrorNotice(data.message || 'Gemini analysis unavailable — deterministic analysis remains available.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotice('Gemini analysis unavailable — deterministic analysis remains available.');
    } finally {
      setIsLoading(false);
      setLoadingStateText('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Real Gemini 3.8 Flash Operational Reasoning</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
          AI Operations Reasoning Assistant
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Connects directly to the live regional inventory state. No hardcoded or pre-written responses — Gemini reasons in real time over current hospital telemetry.
        </p>
      </div>

      {/* Preset Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleExecutePreset(preset.title)}
            disabled={isLoading}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-teal-700/60 transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                  {preset.title}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-teal-400 opacity-80 group-hover:opacity-100" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {preset.description}
              </p>
            </div>
            <div className="text-[10px] text-teal-400 font-mono font-medium flex items-center gap-1">
              <span>Execute Analysis</span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Query Input Box */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>Ask Custom Operational Question to Gemini</span>
            </span>
            <span className="text-[11px] text-teal-400 font-mono">
              Parses & cites current hospital records
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Which hospital has the safest surplus of Norepinephrine to supply Metropolitan General?"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="flex-1 bg-slate-950/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !customQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading State with Specific Messaging */}
      {isLoading && (
        <div className="p-12 rounded-2xl border border-teal-800/60 bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <div className="text-sm font-semibold text-white">
            {loadingStateText || 'Gemini reasoning in progress...'}
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Querying Gemini 3.8 Flash with structured hospital telemetry. Formulating deterministic citations and logistics strategy.
          </p>
        </div>
      )}

      {/* Error Fallback Banner */}
      {errorNotice && (
        <div className="p-4 rounded-xl border border-amber-800 bg-amber-950/30 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{errorNotice}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Deterministic transfer matching continues in Resource Network
          </span>
        </div>
      )}

      {/* Render Structured Preset Analysis Result */}
      {structuredAnalysis && !isLoading && (
        <div className="p-6 rounded-2xl border border-teal-800/80 bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/30 space-y-6 shadow-xl">
          {/* Header Badge Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-800/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-teal-950 text-teal-300 border border-teal-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  GEMINI-POWERED REASONING
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {structuredAnalysis.timestamp}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{activeAnalysisName}</h3>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              {structuredAnalysis.data_used_summary}
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
              Executive Situation Summary
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {structuredAnalysis.summary}
            </p>
          </div>

          {/* Key Findings & Priority Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Findings */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Key Calculated Findings</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {structuredAnalysis.key_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Priority Recommended Actions */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Priority Recommended Actions</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {structuredAnalysis.priority_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">{i + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Transfers from Gemini */}
          {structuredAnalysis.recommended_transfers?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>Gemini Evaluated Inter-Hospital Transfers</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {structuredAnalysis.recommended_transfers.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-900/50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{t.medicine}</span>
                      <span className="text-teal-400 font-mono font-bold">{t.quantity} units</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span>{t.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-rose-300 font-medium">{t.to}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      {t.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning & Assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                Logistical Reasoning & Buffer Protection
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {structuredAnalysis.reasoning}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Stated Logistical Assumptions
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                {structuredAnalysis.assumptions.map((ass, i) => (
                  <li key={i}>{ass}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Affected Facilities List */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Affected Hospitals:</span>
            {structuredAnalysis.affected_facilities.map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-200">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Render Custom Question Result */}
      {customQueryResult && !isLoading && (
        <div className="p-6 rounded-2xl border border-teal-800/80 bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/30 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-teal-800/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-teal-950 text-teal-300 border border-teal-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                GEMINI OPERATIONAL ANSWER
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {customQueryResult.timestamp}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Grounding: Synthetic Dataset Only</span>
          </div>

          {/* Direct Answer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
              ANSWER
            </span>
            <div className="text-sm font-bold text-white leading-relaxed">
              {customQueryResult.answer}
            </div>
          </div>

          {/* Data Citations Table */}
          {customQueryResult.data_citations?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>CITED DATA FROM CURRENT INVENTORY STATE</span>
              </span>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Hospital</th>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Current Stock</th>
                      <th className="py-2.5 px-3">Daily Burn</th>
                      <th className="py-2.5 px-3">Stock Runway</th>
                      <th className="py-2.5 px-3">Calculated Facts / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {customQueryResult.data_citations.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-white">{c.hospital}</td>
                        <td className="py-2.5 px-3 text-slate-300">{c.medicine}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-teal-300">{c.current_stock}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{c.daily_burn}/day</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">{c.stock_runway_days} days</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">{c.metric_notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendation & Rationale Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                RECOMMENDATION
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {customQueryResult.recommendation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                LOGISTICAL RATIONALE
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {customQueryResult.rationale}
              </p>
            </div>
          </div>

          {/* Synthetic Disclaimer Banner */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-amber-400 font-medium">{customQueryResult.synthetic_disclaimer}</span>
            <span className="text-slate-500">Human Administrative Authorization Required</span>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!structuredAnalysis && !customQueryResult && !isLoading && !errorNotice && (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center space-y-3">
          <Bot className="w-8 h-8 text-teal-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Gemini Operations Assistant Ready</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Click any of the 4 operational actions above or submit your own custom operational question to trigger real Gemini reasoning on the current 10-hospital inventory dataset.
          </p>
        </div>
      )}
    </div>
  );
};
