import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Snowflake,
  ShieldAlert,
  ArrowRightLeft,
  X,
  ExternalLink,
} from 'lucide-react';
import { Hospital, InventoryRecord, Medicine, StockStatus, TransferOpportunity } from '../types';

interface InventoryIntelligenceProps {
  hospitals: Hospital[];
  medicines: Medicine[];
  inventory: InventoryRecord[];
  transferOpportunities: TransferOpportunity[];
  selectedHospitalIdFilter: string | null;
  onClearHospitalFilter: () => void;
  onSelectHospitalFilter: (id: string | null) => void;
  onInitiateTransfer: (opportunity: TransferOpportunity) => void;
}

export const InventoryIntelligence: React.FC<InventoryIntelligenceProps> = ({
  hospitals,
  medicines,
  inventory,
  transferOpportunities,
  selectedHospitalIdFilter,
  onClearHospitalFilter,
  onSelectHospitalFilter,
  onInitiateTransfer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'daysToStockout' | 'stock' | 'consumption' | 'expiry'>('daysToStockout');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const medicineMap = useMemo(() => new Map(medicines.map((m) => [m.id, m])), [medicines]);
  const hospitalMap = useMemo(() => new Map(hospitals.map((h) => [h.id, h])), [hospitals]);

  // Unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.category)));
  }, [medicines]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return inventory
      .filter((rec) => {
        const med = medicineMap.get(rec.medicineId);
        const hosp = hospitalMap.get(rec.hospitalId);
        if (!med || !hosp) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            med.name.toLowerCase().includes(q) ||
            med.genericName.toLowerCase().includes(q) ||
            hosp.name.toLowerCase().includes(q) ||
            med.category.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Hospital filter
        if (selectedHospitalIdFilter && rec.hospitalId !== selectedHospitalIdFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && rec.stockStatus !== statusFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && med.category !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        switch (sortField) {
          case 'daysToStockout':
            valA = a.daysToStockout;
            valB = b.daysToStockout;
            break;
          case 'stock':
            valA = a.currentStock;
            valB = b.currentStock;
            break;
          case 'consumption':
            valA = a.averageDailyConsumption;
            valB = b.averageDailyConsumption;
            break;
          case 'expiry':
            valA = a.unitsExpiring30Days;
            valB = b.unitsExpiring30Days;
            break;
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [
    inventory,
    medicineMap,
    hospitalMap,
    searchQuery,
    selectedHospitalIdFilter,
    statusFilter,
    categoryFilter,
    sortField,
    sortAsc,
  ]);

  const handleSort = (field: 'daysToStockout' | 'stock' | 'consumption' | 'expiry') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusBadge = (status: StockStatus, days: number) => {
    switch (status) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Critical ({days}d)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Warning ({days}d)
          </span>
        );
      case 'surplus':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Surplus ({days}d)
          </span>
        );
      case 'stable':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Stable ({days}d)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Inventory Intelligence Grid</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/80">
              {filteredRecords.length} records active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-echelon stock levels, burn velocities, batch expiry exposure, and automated AI replenishment logic.
          </p>
        </div>

        {/* Selected Hospital Filter Tag if set */}
        {selectedHospitalIdFilter && (
          <div className="flex items-center gap-2 bg-teal-950/60 border border-teal-800/70 px-3 py-1.5 rounded-xl text-xs text-teal-300">
            <span>
              Filtered to: <strong>{hospitalMap.get(selectedHospitalIdFilter)?.name}</strong>
            </span>
            <button
              onClick={onClearHospitalFilter}
              className="text-teal-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine, hospital, active ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Hospital Filter Dropdown */}
          <div>
            <select
              value={selectedHospitalIdFilter || 'all'}
              onChange={(e) =>
                onSelectHospitalFilter(e.target.value === 'all' ? null : e.target.value)
              }
              aria-label="Filter by Hospital Facility"
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="all">All Hospitals (10 facilities)</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.region})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Therapeutic Category"
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="all">All Therapeutic Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Field */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as any)}
              aria-label="Sort inventory records by attribute"
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="daysToStockout">Days Until Stockout</option>
              <option value="stock">On-Hand Stock</option>
              <option value="consumption">Daily Consumption</option>
              <option value="expiry">Impending Expiry Risk</option>
            </select>
          </div>
        </div>

        {/* Status Filter Segment Control */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 mr-2">Stock Posture:</span>
          {(['all', 'critical', 'warning', 'stable', 'surplus'] as const).map((status) => {
            const count = inventory.filter((i) =>
              status === 'all' ? true : i.stockStatus === status
            ).length;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Medicine & Class</th>
              <th className="py-3.5 px-4">Hospital Facility</th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('stock')}>
                <div className="flex items-center gap-1 hover:text-teal-400">
                  <span>Current Stock</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('consumption')}>
                <div className="flex items-center gap-1 hover:text-teal-400">
                  <span>Daily Burn</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('daysToStockout')}>
                <div className="flex items-center gap-1 hover:text-teal-400">
                  <span>Stock Runway</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Burn Trend</th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('expiry')}>
                <div className="flex items-center gap-1 hover:text-teal-400">
                  <span>Expiry Exposure</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Algorithmic Recommendation</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No inventory records match your selected filters. Try broadening your search or resetting filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const med = medicineMap.get(rec.medicineId);
                const hosp = hospitalMap.get(rec.hospitalId);
                if (!med || !hosp) return null;

                const isExpanded = expandedRecordId === rec.id;

                // Check if there is an active transfer opportunity where this record is recipient
                const transferOpportunity = transferOpportunities.find(
                  (o) => o.toHospitalId === hosp.id && o.medicineId === med.id
                );

                return (
                  <React.Fragment key={rec.id}>
                    <tr
                      className={`hover:bg-slate-800/40 transition-colors ${
                        rec.stockStatus === 'critical' ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Medicine info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{med.name}</span>
                          {med.coldChainRequired && (
                            <span title="Cold Chain 2-8°C Required">
                              <Snowflake className="w-3.5 h-3.5 text-cyan-400 inline" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {med.genericName}
                        </div>
                        <div className="text-[10px] text-teal-400/80 font-mono mt-0.5">
                          {med.category}
                        </div>
                      </td>

                      {/* Hospital facility */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{hosp.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {hosp.region} · {hosp.facilityType}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                        {rec.currentStock.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-sans">{med.standardUnit}</span>
                      </td>

                      {/* Daily Burn Rate */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {rec.averageDailyConsumption}{' '}
                        <span className="text-[10px] text-slate-400 font-sans">/day</span>
                      </td>

                      {/* Days until stockout with status badge */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(rec.stockStatus, rec.daysToStockout)}
                      </td>

                      {/* Trend */}
                      <td className="py-3.5 px-4">
                        {rec.consumptionTrend === 'increasing' ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+{rec.trendPercent}%</span>
                          </span>
                        ) : rec.consumptionTrend === 'decreasing' ? (
                          <span className="inline-flex items-center gap-1 text-teal-400 font-medium">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>{rec.trendPercent}%</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Minus className="w-3.5 h-3.5" />
                            <span>Stable</span>
                          </span>
                        )}
                      </td>

                      {/* Impending Expiry Risk */}
                      <td className="py-3.5 px-4">
                        {rec.unitsExpiring30Days > 0 ? (
                          <span className="inline-flex items-center gap-1 text-cyan-300 font-mono text-xs font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            <Calendar className="w-3 h-3 text-cyan-400" />
                            {rec.unitsExpiring30Days} units &lt;30d
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Safe</span>
                        )}
                      </td>

                      {/* Algorithmic Recommendation Summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
                          {rec.algorithmicRecommendation}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {transferOpportunity && (
                            <button
                              onClick={() => onInitiateTransfer(transferOpportunity)}
                              title="Initiate transfer from surplus donor"
                              className="px-2.5 py-1 rounded bg-teal-600/90 hover:bg-teal-500 text-white font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Reallocate</span>
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Inspect Batches & Intelligence Detail"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Deep Inspection Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={9} className="p-5 border-t border-b border-slate-800/80">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Batch Detail */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                                <span>Tracked Lot Batches ({rec.batches.length})</span>
                              </h4>
                              <div className="space-y-1.5">
                                {rec.batches.map((b) => (
                                  <div
                                    key={b.batchNumber}
                                    className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-mono text-slate-200 font-semibold">
                                        {b.batchNumber}
                                      </div>
                                      <div className="text-slate-400 text-[10px]">
                                        Expires: {b.expiryDate} ({b.daysUntilExpiry} days)
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-mono text-white font-bold">
                                        {b.quantity} {med.standardUnit}
                                      </div>
                                      {b.expiryRiskTier === 'critical_expiry' && (
                                        <span className="text-[10px] text-cyan-300 font-medium">
                                          Impending Expiry
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Storage & Regulatory Specs */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                                <span>Handling & Cold-Chain Specs</span>
                              </h4>
                              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Dosage Form:</span>
                                  <span className="text-slate-200 font-medium">{med.dosageForm}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Storage Temp:</span>
                                  <span className="text-slate-200 font-medium">{med.storageTemp}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Unit Cost (Est):</span>
                                  <span className="text-slate-200 font-medium">${med.unitCostUsd.toFixed(2)} USD</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Dock Hours:</span>
                                  <span className="text-slate-200 font-medium">{hosp.dockHours}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Logistics Officer:</span>
                                  <span className="text-teal-300 font-medium">{hosp.logisticsLead}</span>
                                </div>
                              </div>
                            </div>

                            {/* Algorithmic Decision Rationale */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                                  <span>Deterministic Buffer Analysis</span>
                                </h4>
                                <span className="text-[11px] text-teal-300 bg-teal-950/70 border border-teal-800/80 px-2 py-0.5 rounded font-mono">
                                  Model: Deterministic Run
                                </span>
                              </div>
                              <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-800/40 text-xs text-slate-300 space-y-2">
                                <p className="leading-relaxed">{rec.algorithmicRecommendation}</p>
                                <div className="pt-2 border-t border-teal-800/30 text-[11px] text-slate-400">
                                  Projected zero-stock breach date:{' '}
                                  <strong className="text-slate-200">
                                    {new Date(rec.projectedStockoutDate).toLocaleString()}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
