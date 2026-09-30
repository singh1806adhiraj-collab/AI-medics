import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Cpu,
  Bot,
  Truck,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Hospital, InventoryRecord, Medicine, MedicineCategory, StressTestResult } from '../types';
import { runScenarioSimulation, SimulationResult } from '../utils/calculations';
import { SCENARIO_PRESETS } from '../data/mockHealthcareData';

interface ScenarioSimulatorProps {
  hospitals: Hospital[];
  medicines: Medicine[];
  baseInventory: InventoryRecord[];
  onApplySimulatedInventory?: (simInventory: InventoryRecord[]) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  hospitals,
  medicines,
  baseInventory,
}) => {
  const [demandModifier, setDemandModifier] = useState<number>(0.70); // +70% default for demo step 4
  const [supplyDisruption, setSupplyDisruption] = useState<number>(-0.30); // -30% default for demo step 4
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Gemini AI Stress Test State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [stressTestReport, setStressTestReport] = useState<StressTestResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Automated Rebalance simulation state
  const [rebalanceSimulated, setRebalanceSimulated] = useState(false);

  const hospitalMap = useMemo(() => new Map(hospitals.map((h) => [h.id, h])), [hospitals]);
  const medicineMap = useMemo(() => new Map(medicines.map((m) => [m.id, m])), [medicines]);

  const categories = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.category)));
  }, [medicines]);

  // STAGE 1: Deterministic simulation calculation (runs automatically as sliders move!)
  const simulation: SimulationResult = useMemo(() => {
    const affectedCats: MedicineCategory[] | 'all' =
      selectedCategory === 'all' ? 'all' : [selectedCategory as MedicineCategory];

    return runScenarioSimulation(baseInventory, demandModifier, supplyDisruption, affectedCats);
  }, [baseInventory, demandModifier, supplyDisruption, selectedCategory]);

  // Handle Preset Selection
  const applyPreset = (presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setDemandModifier(preset.demandModifier);
    setSupplyDisruption(preset.supplyDisruption);
    if (preset.affectedCategories === 'all') {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(preset.affectedCategories[0]);
    }
    setStressTestReport(null);
    setAiError(null);
    setRebalanceSimulated(false);
  };

  // STAGE 2: Execute Gemini Strategic Stress Test Reasoning over Deterministic Numbers
  const runAiStressTest = async () => {
    setIsAiLoading(true);
    setLoadingStep('Stage 1: Deterministic Engine computing shock parameters...');
    setStressTestReport(null);
    setAiError(null);

    // Brief deterministic delay for visible multi-stage feedback
    await new Promise((resolve) => setTimeout(resolve, 400));
    setLoadingStep('Stage 2: Gemini 3.8 Flash synthesizing supply chain resilience reasoning...');

    const scenarioParams = {
      demandModifier,
      supplyDisruption,
      selectedCategory,
    };

    const simulationFindings = {
      totalShortages: simulation.totalShortages,
      criticalIncreaseCount: simulation.criticalIncreaseCount,
      baselineCriticalCount: simulation.baselineCriticalCount,
      totalUnitsDeficit: simulation.totalUnitsDeficit,
      networkResilienceScore: simulation.networkResilienceScore,
      avgNetworkDaysBuffer: simulation.avgNetworkDaysBuffer,
      newlyVulnerableFacilities: simulation.newlyDeficientHospitals.map(
        (v) => `${v.hospitalName}: ${v.medicineName} (${v.baselineDays}d -> ${v.projectedDays}d)`
      ),
      criticalMedicines: simulation.criticalMedicinesList,
    };

    try {
      const res = await fetch('/api/gemini/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioParams,
          simulationFindings,
        }),
      });

      const data = await res.json();
      if (res.ok && data.scenario_summary) {
        setStressTestReport(data);
      } else {
        setAiError(data.message || 'Gemini analysis unavailable — deterministic analysis remains available.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Gemini analysis unavailable — deterministic analysis remains available.');
    } finally {
      setIsAiLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Stage 1: Deterministic Math · Stage 2: Gemini Reasoning</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
          Scenario Simulator & Stress Test Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Dynamically recalculate every inventory record under demand surges and distributor delivery freezes, then feed simulated telemetry to Gemini for operational resilience reasoning.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIO_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-teal-500 bg-teal-950/40 shadow-sm ring-1 ring-teal-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{preset.name}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
              </div>
              <p className="text-[11px] text-teal-300 font-medium mt-1">{preset.tagline}</p>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>Demand: +{Math.round(preset.demandModifier * 100)}%</span>
                <span>Supply: {Math.round(preset.supplyDisruption * 100)}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulation Controls Panel */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Demand Surge */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span>Patient Demand Surge</span>
              </span>
              <span className="font-mono font-bold text-rose-400 text-sm">
                +{Math.round(demandModifier * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={demandModifier}
              onChange={(e) => {
                setDemandModifier(parseFloat(e.target.value));
                setActivePresetId(null);
                setRebalanceSimulated(false);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Normal (0%)</span>
              <span>+50% Surge</span>
              <span>+100% Critical Spike</span>
            </div>
          </div>

          {/* Slider 2: Supply Disruption */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Supplier Delivery Bottleneck</span>
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {Math.round(supplyDisruption * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="-0.60"
              max="0"
              step="0.05"
              value={supplyDisruption}
              onChange={(e) => {
                setSupplyDisruption(parseFloat(e.target.value));
                setActivePresetId(null);
                setRebalanceSimulated(false);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-60% Severe Freeze</span>
              <span>-30% Moderate</span>
              <span>0% Full Delivery</span>
            </div>
          </div>

          {/* Target Category Select */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Targeted Therapeutic Class</span>
              </span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setActivePresetId(null);
                setRebalanceSimulated(false);
              }}
              aria-label="Select target therapeutic category for scenario"
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="all">All Therapeutic Categories (Whole Network)</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              Isolates shock to critical care, antibiotics, or respiratory classes.
            </p>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDemandModifier(0);
                setSupplyDisruption(0);
                setSelectedCategory('all');
                setActivePresetId('baseline');
                setStressTestReport(null);
                setAiError(null);
                setRebalanceSimulated(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
            <button
              onClick={() => setRebalanceSimulated(true)}
              className="px-3 py-2 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium border border-cyan-700/50 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Simulate Algorithmic Rebalancing</span>
            </button>
          </div>

          <button
            onClick={runAiStressTest}
            disabled={isAiLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-teal-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingStep || 'Processing Stress Test...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Run Gemini Strategic Stress Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STAGE 1: Deterministic Simulation Output Banner */}
      <div className="p-4 rounded-xl border border-cyan-800/60 bg-slate-900/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
            STAGE 1 · DETERMINISTIC ENGINE
          </span>
          <span className="text-slate-300">
            Recalculated every record with formula: <code className="text-teal-300">burn = base * (1 + {demandModifier})</code>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          160 inventory records evaluated deterministically
        </span>
      </div>

      {/* Simulated Results KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Network Resilience Score */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Network Resilience Score</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                simulation.networkResilienceScore < 50
                  ? 'text-rose-400'
                  : simulation.networkResilienceScore < 75
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {simulation.networkResilienceScore}%
            </span>
            <span className="text-[11px] text-slate-400">
              {simulation.networkResilienceScore < 50
                ? 'Severe Strain'
                : simulation.networkResilienceScore < 75
                ? 'Strained'
                : 'Resilient'}
            </span>
          </div>
        </div>

        {/* Total Shortages Projected */}
        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/15">
          <div className="text-xs text-rose-300 font-medium">Projected Stockouts</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{simulation.totalShortages}</span>
            {simulation.criticalIncreaseCount > 0 && (
              <span className="text-[11px] text-rose-300 font-bold">
                (+{simulation.criticalIncreaseCount} new breaches)
              </span>
            )}
          </div>
        </div>

        {/* Total Deficit Units */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Deficit Units Needed</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {simulation.totalUnitsDeficit.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">units to safe buffer</span>
          </div>
        </div>

        {/* Average Network Runway */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Average Network Runway</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-400">
              {simulation.avgNetworkDaysBuffer}
            </span>
            <span className="text-[11px] text-slate-400">days remaining</span>
          </div>
        </div>
      </div>

      {/* Newly Vulnerable Facilities Breakdown */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Newly Vulnerable Facilities Under Current Shock ({simulation.newlyDeficientHospitals.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Critical Threshold Breached (&lt;3 days)
          </span>
        </div>

        {simulation.newlyDeficientHospitals.length === 0 ? (
          <p className="text-xs text-slate-400">
            Baseline state: Only the 5 initial critical facilities are below thresholds. Adjust sliders to view new shock breaches.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {simulation.newlyDeficientHospitals.map((v, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/60 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{v.hospitalName}</span>
                  <span className="text-rose-400 font-mono font-bold">{v.projectedDays}d left</span>
                </div>
                <div className="text-slate-300 text-[11px] font-medium">
                  {v.medicineName}
                </div>
                <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Baseline: {v.baselineDays}d</span>
                  <span className="text-rose-400 font-semibold">
                    -{(v.baselineDays - v.projectedDays).toFixed(1)}d loss
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STAGE 2: Gemini Strategic Stress Test Output */}
      {stressTestReport && (
        <div className="p-6 rounded-2xl border border-teal-800/80 bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/40 space-y-6 shadow-xl">
          {/* Section Header with Distinct Stage 2 Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-800/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-teal-950 text-teal-300 border border-teal-700">
                  STAGE 2 · GEMINI 3.8 REASONING
                </span>
                <span className="text-xs text-slate-400 font-mono">{stressTestReport.timestamp}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Gemini Strategic Stress Test & Inter-Hospital Redistribution Briefing
              </h3>
            </div>
            <span className="text-xs text-teal-300 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              Reasoned Over Deterministic Findings
            </span>
          </div>

          {/* Scenario Summary & Network Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                Scenario Summary
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {stressTestReport.scenario_summary}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Network Impact Assessment
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {stressTestReport.network_impact}
              </p>
            </div>
          </div>

          {/* Recommended Interventions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Prioritized Strategic Interventions</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stressTestReport.recommended_interventions.map((action, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Redistribution Plan */}
          {stressTestReport.redistribution_plan?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Gemini Recommended Mutual-Aid Redistribution Corridors</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stressTestReport.redistribution_plan.map((plan, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-cyan-900/50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{plan.medicine}</span>
                      <span className="font-bold text-teal-400 font-mono">{plan.units} units</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span>{plan.donor}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="text-rose-300 font-medium">{plan.recipient}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      {plan.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Risks & Reasoning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-900/40 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Top Operational Risks</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {stressTestReport.top_risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                Analytical Reasoning
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stressTestReport.reasoning}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Decision Support Intelligence · Synthetic Demonstration Telemetry</span>
            <span className="text-teal-400 font-medium">Requires Human Hospital Administrator Sign-off</span>
          </div>
        </div>
      )}

      {/* Error state fallback banner */}
      {aiError && (
        <div className="p-4 rounded-xl border border-amber-800 bg-amber-950/30 text-xs text-amber-300 flex items-center justify-between">
          <span>{aiError}</span>
          <button
            onClick={runAiStressTest}
            className="px-2.5 py-1 rounded bg-amber-900 hover:bg-amber-800 text-white font-medium"
          >
            Retry Gemini
          </button>
        </div>
      )}
    </div>
  );
};
