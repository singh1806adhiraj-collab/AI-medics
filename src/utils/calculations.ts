import {
  BatchInfo,
  Hospital,
  InventoryRecord,
  Medicine,
  MedicineCategory,
  StockStatus,
  TransferOpportunity,
} from '../types';
import { HOSPITALS, MEDICINES } from '../data/mockHealthcareData';

/**
 * Deterministic distance calculation between two hospitals in miles and estimated courier transit minutes.
 */
export function calculateLogisticsDistance(
  h1: Hospital,
  h2: Hospital
): { miles: number; minutes: number } {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((h2.coordinates.lat - h1.coordinates.lat) * Math.PI) / 180;
  const dLng = ((h2.coordinates.lng - h1.coordinates.lng) * Math.PI) / 180;
  const lat1 = (h1.coordinates.lat * Math.PI) / 180;
  const lat2 = (h2.coordinates.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightMiles = R * c;

  // Road factor & speed
  const actualRoadMiles = Math.max(1.8, Math.round(straightMiles * 1.28 * 10) / 10);
  const estMinutes = Math.max(8, Math.round((actualRoadMiles / 30) * 60 + 5));

  return { miles: actualRoadMiles, minutes: estMinutes };
}

function pseudoRandom(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

function generateBatches(
  stock: number,
  medId: string,
  hospId: string
): { batches: BatchInfo[]; expiring30: number; expiring60: number } {
  const batches: BatchInfo[] = [];
  let remaining = stock;
  let batchIndex = 1;
  let expiring30 = 0;
  let expiring60 = 0;

  const today = new Date('2026-09-30T12:00:00Z');

  // Specific high-profile expiry scenarios for demonstration of waste prevention:
  const isHighWasteCandidate =
    (hospId === 'HOSP-03' && medId === 'MED-01') || // Valley Med has expiring Norepinephrine (240 units)
    (hospId === 'HOSP-08' && medId === 'MED-03') || // Highland has expiring Cefepime
    (hospId === 'HOSP-02' && medId === 'MED-06');   // St. Jude has expiring Insulin

  if (isHighWasteCandidate && stock > 100) {
    const wasteQty = Math.min(240, Math.floor(stock * 0.32));
    const expDate = new Date(today);
    expDate.setDate(today.getDate() + 22); // 22 days to expiry
    batches.push({
      batchNumber: `EXP-${hospId.slice(-2)}${medId.slice(-2)}-B01`,
      quantity: wasteQty,
      expiryDate: expDate.toISOString().split('T')[0],
      daysUntilExpiry: 22,
      expiryRiskTier: 'critical_expiry',
    });
    expiring30 += wasteQty;
    expiring60 += wasteQty;
    remaining -= wasteQty;
    batchIndex++;
  }

  while (remaining > 0 && batchIndex <= 4) {
    const isLast = batchIndex === 4 || remaining <= 30;
    const splitQty = isLast
      ? remaining
      : Math.floor(remaining * (0.4 + pseudoRandom(`${medId}-${hospId}-${batchIndex}`) * 0.3));
    const qty = Math.max(1, Math.min(splitQty, remaining));
    remaining -= qty;

    const daysOut = 35 + Math.floor(pseudoRandom(`${medId}-${hospId}-days-${batchIndex}`) * 320);
    const expDate = new Date(today);
    expDate.setDate(today.getDate() + daysOut);

    let tier: BatchInfo['expiryRiskTier'] = 'safe';
    if (daysOut <= 30) {
      tier = 'critical_expiry';
      expiring30 += qty;
      expiring60 += qty;
    } else if (daysOut <= 60) {
      tier = 'moderate_expiry';
      expiring60 += qty;
    }

    batches.push({
      batchNumber: `LOT-26-${hospId.slice(-2)}${medId.slice(-2)}-0${batchIndex}`,
      quantity: qty,
      expiryDate: expDate.toISOString().split('T')[0],
      daysUntilExpiry: daysOut,
      expiryRiskTier: tier,
    });
    batchIndex++;
  }

  return { batches, expiring30, expiring60 };
}

/**
 * Deterministic Initial Inventory Matrix
 * Ensures exactly 10 hospitals × 16 medicines = 160 records.
 * Baseline starts with exactly 5 critical shortages:
 * 1. Metro Gen (HOSP-01) -> Norepinephrine (MED-01)
 * 2. Children's Health Pavilion (HOSP-04) -> Albuterol (MED-04)
 * 3. Apex Trauma (HOSP-05) -> Cefepime (MED-03)
 * 4. Pine Ridge Rural (HOSP-10) -> Regular Insulin (MED-06)
 * 5. Cedar Memorial (HOSP-06) -> Propofol (MED-02)
 */
export function buildInitialInventory(): InventoryRecord[] {
  const records: InventoryRecord[] = [];

  for (const hospital of HOSPITALS) {
    const bedFactor = hospital.totalBeds / 450;

    for (const medicine of MEDICINES) {
      const recordId = `INV-${hospital.id}-${medicine.id}`;
      const seed = `${hospital.id}:${medicine.id}`;
      const p = pseudoRandom(seed);

      let baseDaily = 12;
      switch (medicine.category) {
        case 'Vasopressors & Emergency':
          baseDaily = 22 * bedFactor * (hospital.facilityType.includes('Trauma') ? 1.6 : 0.8);
          break;
        case 'Critical Care & Anesthesia':
          baseDaily = 18 * bedFactor * (hospital.icuBeds / 45);
          break;
        case 'Antibiotics & Anti-Infectives':
          baseDaily = 25 * bedFactor;
          break;
        case 'Respiratory & Airway':
          baseDaily = 28 * bedFactor * (hospital.id === 'HOSP-04' ? 1.9 : 1.0);
          break;
        case 'Anticoagulants & Hematology':
          baseDaily = 20 * bedFactor;
          break;
        case 'Metabolic & Endocrine':
          baseDaily = 16 * bedFactor;
          break;
      }
      baseDaily = Math.max(3, Math.round(baseDaily * 10) / 10);

      let currentStock = 0;
      let trend: InventoryRecord['consumptionTrend'] = 'stable';
      let trendPercent = Math.round(pseudoRandom(`${seed}-trend`) * 20 - 8);

      // The 5 engineered baseline critical shortages:
      // 1. Metro Gen (HOSP-01) -> Norepinephrine (MED-01)
      if (hospital.id === 'HOSP-01' && medicine.id === 'MED-01') {
        currentStock = 74; // 74 / 42 = 1.76 days
        baseDaily = 42;
        trend = 'increasing';
        trendPercent = +28;
      }
      // 1b. Designated Surplus donor: Valley Med (HOSP-03) on Norepinephrine
      else if (hospital.id === 'HOSP-03' && medicine.id === 'MED-01') {
        currentStock = 880; // 880 / 26 = 33.8 days
        baseDaily = 26;
        trend = 'stable';
        trendPercent = -2;
      }
      // 2. Children's Pavilion (HOSP-04) -> Albuterol (MED-04)
      else if (hospital.id === 'HOSP-04' && medicine.id === 'MED-04') {
        currentStock = 44; // 44 / 23 = 1.91 days
        baseDaily = 23;
        trend = 'increasing';
        trendPercent = +34;
      }
      // 2b. Surplus donor: Highland Univ (HOSP-08) on Albuterol
      else if (hospital.id === 'HOSP-08' && medicine.id === 'MED-04') {
        currentStock = 720; // 720 / 26 = 27.7 days
        baseDaily = 26;
      }
      // 3. Apex Trauma (HOSP-05) -> Cefepime (MED-03)
      else if (hospital.id === 'HOSP-05' && medicine.id === 'MED-03') {
        currentStock = 65; // 65 / 31 = 2.10 days
        baseDaily = 31;
        trend = 'increasing';
        trendPercent = +19;
      }
      // 3b. Surplus donor: Highland Univ (HOSP-08) on Cefepime
      else if (hospital.id === 'HOSP-08' && medicine.id === 'MED-03') {
        currentStock = 640; // 640 / 24.5 = 26.1 days
        baseDaily = 24.5;
      }
      // 4. Pine Ridge Rural (HOSP-10) -> Regular Insulin (MED-06)
      else if (hospital.id === 'HOSP-10' && medicine.id === 'MED-06') {
        currentStock = 9; // 9 / 4.1 = 2.20 days
        baseDaily = 4.1;
      }
      // 4b. Donor for Insulin: St. Jude Reg (HOSP-02)
      else if (hospital.id === 'HOSP-02' && medicine.id === 'MED-06') {
        currentStock = 390; // 390 / 16 = 24.4 days
        baseDaily = 16;
      }
      // 5. Cedar Memorial (HOSP-06) -> Propofol (MED-02)
      else if (hospital.id === 'HOSP-06' && medicine.id === 'MED-02') {
        currentStock = 28; // 28 / 12 = 2.33 days
        baseDaily = 12;
      }
      // All other records: healthy buffer (ensure > critical buffer)
      else {
        // days between 5.5 and 26
        const days = Math.round(6 + p * 20);
        currentStock = Math.round(baseDaily * days);
        if (p < 0.22) {
          trend = 'increasing';
          trendPercent = Math.round(10 + p * 15);
        } else if (p > 0.78) {
          trend = 'decreasing';
          trendPercent = -Math.round(5 + (1 - p) * 12);
        }
      }

      const daysToStockout = Math.round((currentStock / baseDaily) * 10) / 10;

      let status: StockStatus = 'stable';
      if (daysToStockout <= medicine.criticalBufferDays) {
        status = 'critical';
      } else if (daysToStockout <= medicine.warningBufferDays) {
        status = 'warning';
      } else if (daysToStockout >= medicine.surplusBufferDays) {
        status = 'surplus';
      }

      const stockoutDate = new Date('2026-09-30T12:00:00Z');
      stockoutDate.setHours(stockoutDate.getHours() + Math.round(daysToStockout * 24));
      const projectedStockoutDate = stockoutDate.toISOString();

      const { batches, expiring30, expiring60 } = generateBatches(currentStock, medicine.id, hospital.id);

      // Algorithmic decision support recommendation
      let algorithmicRec = '';
      if (status === 'critical') {
        algorithmicRec = `URGENT STOCKOUT: ${daysToStockout} days runway remaining (${Math.round(daysToStockout * 24)}h). Eligible for priority mutual-aid replenishment.`;
      } else if (status === 'warning') {
        algorithmicRec = `WARNING BUFFER: Stock buffer at ${daysToStockout} days. Monitor delivery lead times; prepare mutual reserve request.`;
      } else if (status === 'surplus' && expiring30 > 0) {
        algorithmicRec = `EXPIRY RISK: ${expiring30} units expiring in <30 days. Priority donor candidate for partner hospital re-routing to prevent waste.`;
      } else if (status === 'surplus') {
        algorithmicRec = `SURPLUS RESERVE: Buffer at ${daysToStockout} days. Eligible mutual-aid donor under regional compact.`;
      } else {
        algorithmicRec = `STABLE INVENTORY: Consumption velocity (${baseDaily} ${medicine.standardUnit}/day) within safety buffer (${daysToStockout} days).`;
      }

      records.push({
        id: recordId,
        hospitalId: hospital.id,
        medicineId: medicine.id,
        currentStock,
        averageDailyConsumption: baseDaily,
        dailyConsumptionStdDev: Math.round(baseDaily * 0.18 * 10) / 10,
        consumptionTrend: trend,
        trendPercent,
        batches,
        lastDeliveryDate: '2026-09-24',
        daysToStockout,
        stockStatus: status,
        projectedStockoutDate,
        unitsExpiring30Days: expiring30,
        unitsExpiring60Days: expiring60,
        algorithmicRecommendation: algorithmicRec,
      });
    }
  }

  return records;
}

/**
 * Real Redistribution Algorithm:
 * Evaluates all critical shortages and finds feasible donors using deterministic scoring:
 * donorScore = stockSurplusScore + expiryBenefitScore + transitScore + recipientUrgencyScore
 * Excludes donors that would fall below minimum 14-day safety buffer.
 * Does not invent transfers if no feasible donor exists.
 */
export function calculateTransferOpportunities(
  inventory: InventoryRecord[],
  hospitals: Hospital[],
  medicines: Medicine[]
): TransferOpportunity[] {
  const hospitalMap = new Map(hospitals.map((h) => [h.id, h]));
  const medicineMap = new Map(medicines.map((m) => [m.id, m]));

  const opportunities: TransferOpportunity[] = [];

  // Group inventory by medicine
  const byMedicine = new Map<string, InventoryRecord[]>();
  for (const inv of inventory) {
    if (!byMedicine.has(inv.medicineId)) {
      byMedicine.set(inv.medicineId, []);
    }
    byMedicine.get(inv.medicineId)!.push(inv);
  }

  for (const [medId, records] of byMedicine.entries()) {
    const med = medicineMap.get(medId);
    if (!med) continue;

    // Filter shortages (< criticalBufferDays)
    const shortages = records
      .filter((r) => r.stockStatus === 'critical')
      .sort((a, b) => a.daysToStockout - b.daysToStockout);

    // Potential donors: facilities with daysToStockout > 14
    const candidateDonors = records.filter((r) => r.daysToStockout > 14);

    for (const recipient of shortages) {
      const recipientHosp = hospitalMap.get(recipient.hospitalId);
      if (!recipientHosp) continue;

      // Bring recipient up to target safe buffer (e.g. 10 days)
      const targetDays = 10;
      const unitsNeeded = Math.ceil(
        (targetDays - recipient.daysToStockout) * recipient.averageDailyConsumption
      );
      if (unitsNeeded <= 0) continue;

      // Score and rank all feasible donors for this recipient
      interface ScoredDonor {
        donorRecord: InventoryRecord;
        donorHosp: Hospital;
        transferQty: number;
        donorRunwayBefore: number;
        donorRunwayAfter: number;
        recipientRunwayBefore: number;
        recipientRunwayAfter: number;
        expiryUnitsSaved: number;
        distMiles: number;
        transitMinutes: number;
        donorScore: number;
        scoringDetails: {
          stockSurplusScore: number;
          expiryBenefitScore: number;
          transitScore: number;
          recipientUrgencyScore: number;
        };
      }

      const feasibleDonors: ScoredDonor[] = [];

      for (const donor of candidateDonors) {
        if (donor.hospitalId === recipient.hospitalId) continue;
        const donorHosp = hospitalMap.get(donor.hospitalId);
        if (!donorHosp) continue;

        // Ensure donor preserves at least 14 days of safety stock
        const donorMinSafetyStock = Math.ceil(donor.averageDailyConsumption * 14);
        const donorAvailable = donor.currentStock - donorMinSafetyStock;

        // Exclude if donor cannot give at least 10 units
        if (donorAvailable < 10) continue;

        const transferQty = Math.min(unitsNeeded, Math.floor(donorAvailable));
        if (transferQty < 5) continue;

        const dist = calculateLogisticsDistance(donorHosp, recipientHosp);

        const donorRunwayBefore = donor.daysToStockout;
        const donorRunwayAfter =
          Math.round(((donor.currentStock - transferQty) / donor.averageDailyConsumption) * 10) / 10;

        // Double check post buffer >= 14 days
        if (donorRunwayAfter < 13.9) continue;

        const recipientRunwayBefore = recipient.daysToStockout;
        const recipientRunwayAfter =
          Math.round(((recipient.currentStock + transferQty) / recipient.averageDailyConsumption) * 10) / 10;

        const expiryUnitsSaved = Math.min(transferQty, donor.unitsExpiring30Days);

        // Deterministic scoring components (Max 100 points)
        // 1. Surplus Score (up to 40 pts): how much runway donor has left over threshold
        const stockSurplusScore = Math.min(40, Math.round((donorRunwayAfter - 14) * 2));

        // 2. Expiry Benefit Score (up to 30 pts): prioritizing donors with expiring units to prevent waste
        const expiryBenefitScore =
          expiryUnitsSaved > 0 ? Math.min(30, Math.round(expiryUnitsSaved * 0.15 + 10)) : 0;

        // 3. Transit Distance Score (up to 20 pts): closer facilities preferred
        const transitScore = Math.max(0, Math.round(20 - dist.minutes * 0.3));

        // 4. Recipient Urgency Score (up to 10 pts)
        const recipientUrgencyScore = recipient.daysToStockout <= 2 ? 10 : 5;

        const donorScore = stockSurplusScore + expiryBenefitScore + transitScore + recipientUrgencyScore;

        feasibleDonors.push({
          donorRecord: donor,
          donorHosp,
          transferQty,
          donorRunwayBefore,
          donorRunwayAfter,
          recipientRunwayBefore,
          recipientRunwayAfter,
          expiryUnitsSaved,
          distMiles: dist.miles,
          transitMinutes: dist.minutes,
          donorScore,
          scoringDetails: {
            stockSurplusScore,
            expiryBenefitScore,
            transitScore,
            recipientUrgencyScore,
          },
        });
      }

      if (feasibleDonors.length === 0) {
        // No feasible donor exists under safety constraints. Do NOT invent a fake transfer.
        continue;
      }

      // Rank by donorScore descending
      feasibleDonors.sort((a, b) => b.donorScore - a.donorScore);
      const topMatch = feasibleDonors[0];

      const daysGained = Math.round((topMatch.recipientRunwayAfter - topMatch.recipientRunwayBefore) * 10) / 10;
      const urgency: TransferOpportunity['urgency'] =
        recipient.daysToStockout <= 2.2 ? 'immediate' : recipient.daysToStockout <= 3.5 ? 'high' : 'routine';

      const rationaleText =
        topMatch.expiryUnitsSaved > 0
          ? `Algorithmic donor match (Score: ${topMatch.donorScore}/100): ${topMatch.donorHosp.shortName} transfers ${topMatch.transferQty} ${med.standardUnit} to ${recipientHosp.shortName}. Dual benefit: salvages ${topMatch.expiryUnitsSaved} units facing <30d expiration while increasing recipient runway by +${daysGained}d (${topMatch.recipientRunwayBefore}d -> ${topMatch.recipientRunwayAfter}d). Leaves donor with a safe ${topMatch.donorRunwayAfter}d buffer (>=14d threshold). Transit: ${topMatch.transitMinutes} mins (${topMatch.distMiles} mi).`
          : `Algorithmic donor match (Score: ${topMatch.donorScore}/100): ${topMatch.donorHosp.shortName} transfers ${topMatch.transferQty} ${med.standardUnit} to ${recipientHosp.shortName}. Extends recipient runway by +${daysGained}d (${topMatch.recipientRunwayBefore}d -> ${topMatch.recipientRunwayAfter}d). Leaves donor with a safe ${topMatch.donorRunwayAfter}d buffer. Transit: ${topMatch.transitMinutes} mins (${topMatch.distMiles} mi).`;

      opportunities.push({
        id: `TRANS-${topMatch.donorHosp.id}-${recipientHosp.id}-${med.id}`,
        medicineId: med.id,
        medicineName: med.name,
        medicineCategory: med.category,
        fromHospitalId: topMatch.donorHosp.id,
        fromHospitalName: topMatch.donorHosp.name,
        toHospitalId: recipientHosp.id,
        toHospitalName: recipientHosp.name,
        recommendedQuantity: topMatch.transferQty,
        distanceMiles: topMatch.distMiles,
        estTransitMinutes: topMatch.transitMinutes,
        urgency,
        impactDaysGained: daysGained,
        donorPreBufferDays: topMatch.donorRunwayBefore,
        donorPostBufferDays: topMatch.donorRunwayAfter,
        recipientPreBufferDays: topMatch.recipientRunwayBefore,
        recipientPostBufferDays: topMatch.recipientRunwayAfter,
        expiryUnitsSaved: topMatch.expiryUnitsSaved,
        coldChain: med.coldChainRequired,
        donorScore: topMatch.donorScore,
        scoringDetails: topMatch.scoringDetails,
        rationale: rationaleText,
        status: 'suggested',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return opportunities;
}

/**
 * Execute a transfer in state:
 * Updates donor and recipient inventory records deterministically,
 * recalculating runways, batches, and status.
 */
export function applyTransferToInventory(
  currentInventory: InventoryRecord[],
  transfer: TransferOpportunity
): InventoryRecord[] {
  const medicineMap = new Map(MEDICINES.map((m) => [m.id, m]));
  const med = medicineMap.get(transfer.medicineId);
  const criticalBuffer = med?.criticalBufferDays || 3;
  const warningBuffer = med?.warningBufferDays || 7;
  const surplusBuffer = med?.surplusBufferDays || 21;

  return currentInventory.map((rec) => {
    if (rec.medicineId === transfer.medicineId) {
      // 1. Donor Hospital
      if (rec.hospitalId === transfer.fromHospitalId) {
        const newStock = Math.max(0, rec.currentStock - transfer.recommendedQuantity);
        const days = Math.round((newStock / rec.averageDailyConsumption) * 10) / 10;
        const newStatus: StockStatus =
          days <= criticalBuffer ? 'critical' : days <= warningBuffer ? 'warning' : days >= surplusBuffer ? 'surplus' : 'stable';

        return {
          ...rec,
          currentStock: newStock,
          daysToStockout: days,
          stockStatus: newStatus,
          unitsExpiring30Days: Math.max(0, rec.unitsExpiring30Days - transfer.expiryUnitsSaved),
          algorithmicRecommendation: `POST-DISPATCH: Dispatched ${transfer.recommendedQuantity} units to ${transfer.toHospitalName}. Buffer retained: ${days} days (safe).`,
        };
      }

      // 2. Recipient Hospital
      if (rec.hospitalId === transfer.toHospitalId) {
        const newStock = rec.currentStock + transfer.recommendedQuantity;
        const days = Math.round((newStock / rec.averageDailyConsumption) * 10) / 10;
        const newStatus: StockStatus =
          days <= criticalBuffer ? 'critical' : days <= warningBuffer ? 'warning' : days >= surplusBuffer ? 'surplus' : 'stable';

        return {
          ...rec,
          currentStock: newStock,
          daysToStockout: days,
          stockStatus: newStatus,
          algorithmicRecommendation: `REPLENISHED VIA MUTUAL-AID: Received ${transfer.recommendedQuantity} units from ${transfer.fromHospitalName}. Runway extended to ${days} days.`,
        };
      }
    }
    return rec;
  });
}

/**
 * Deterministic Simulation Engine:
 * Recalculates every record based on demand modifier & supply disruption:
 * projectedDailyBurn = baselineDailyBurn * (1 + demandChange)
 * projectedStock = currentStock - lostSupplyOverHorizon
 * projectedDaysUntilStockout = projectedStock / projectedDailyBurn
 */
export interface SimulationResult {
  simulatedInventory: InventoryRecord[];
  totalShortages: number;
  criticalIncreaseCount: number;
  newlyDeficientHospitals: Array<{
    hospitalId: string;
    hospitalName: string;
    medicineName: string;
    projectedDays: number;
    baselineDays: number;
  }>;
  criticalMedicinesList: string[];
  totalUnitsDeficit: number;
  networkResilienceScore: number; // 0-100
  avgNetworkDaysBuffer: number;
  baselineCriticalCount: number;
}

export function runScenarioSimulation(
  baseInventory: InventoryRecord[],
  demandModifier: number, // e.g. 0.70 = +70%
  supplyDisruption: number, // e.g. -0.30 = -30%
  affectedCategories: MedicineCategory[] | 'all',
  focalHospitals?: string[]
): SimulationResult {
  const medicineMap = new Map(MEDICINES.map((m) => [m.id, m]));
  const hospitalMap = new Map(HOSPITALS.map((h) => [h.id, h]));

  let criticalCount = 0;
  let totalDeficitUnits = 0;
  let totalDaysBuffer = 0;
  const newlyVulnerable: SimulationResult['newlyDeficientHospitals'] = [];
  const criticalMedicinesSet = new Set<string>();

  const baselineCriticalCount = baseInventory.filter((r) => r.stockStatus === 'critical').length;

  const simulatedInventory = baseInventory.map((record) => {
    const med = medicineMap.get(record.medicineId);
    const hosp = hospitalMap.get(record.hospitalId);
    const category = med?.category;

    const isCategoryAffected =
      affectedCategories === 'all' || (category && affectedCategories.includes(category));
    const isHospitalFocal =
      !focalHospitals || focalHospitals.length === 0 || focalHospitals.includes(record.hospitalId);

    let effectiveDemandMod = 0;
    if (isCategoryAffected && isHospitalFocal) {
      effectiveDemandMod = demandModifier;
    } else if (isCategoryAffected) {
      effectiveDemandMod = demandModifier * 0.4;
    }

    // projectedDailyBurn = baselineDailyBurn * (1 + demandChange)
    const projectedDailyBurn =
      Math.round(record.averageDailyConsumption * (1 + effectiveDemandMod) * 10) / 10;

    // Projected Stock considering supply disruption over a 7-day projection horizon
    let projectedStock = record.currentStock;
    if (supplyDisruption < 0 && isCategoryAffected) {
      const standardInboundWeekly = record.averageDailyConsumption * 7;
      const lostInbound = standardInboundWeekly * Math.abs(supplyDisruption) * 0.6;
      projectedStock = Math.max(0, Math.round(projectedStock - lostInbound));
    }

    const projectedDaysUntilStockout =
      Math.round((projectedStock / projectedDailyBurn) * 10) / 10;
    totalDaysBuffer += projectedDaysUntilStockout;

    const criticalThreshold = med?.criticalBufferDays || 3;
    const warningThreshold = med?.warningBufferDays || 7;
    const surplusThreshold = med?.surplusBufferDays || 21;

    let newRiskLevel: StockStatus = 'stable';
    if (projectedDaysUntilStockout <= criticalThreshold) {
      newRiskLevel = 'critical';
      criticalCount++;
      if (med) criticalMedicinesSet.add(med.name);

      if (record.stockStatus !== 'critical') {
        newlyVulnerable.push({
          hospitalId: record.hospitalId,
          hospitalName: hosp?.name || record.hospitalId,
          medicineName: med?.name || record.medicineId,
          projectedDays: projectedDaysUntilStockout,
          baselineDays: record.daysToStockout,
        });
      }

      // Safe buffer units (7 days)
      const safeBufferUnits = projectedDailyBurn * 7;
      totalDeficitUnits += Math.max(0, Math.round(safeBufferUnits - projectedStock));
    } else if (projectedDaysUntilStockout <= warningThreshold) {
      newRiskLevel = 'warning';
    } else if (projectedDaysUntilStockout >= surplusThreshold) {
      newRiskLevel = 'surplus';
    }

    return {
      ...record,
      averageDailyConsumption: projectedDailyBurn,
      currentStock: projectedStock,
      daysToStockout: projectedDaysUntilStockout,
      stockStatus: newRiskLevel,
    };
  });

  const avgNetworkDaysBuffer =
    Math.round((totalDaysBuffer / simulatedInventory.length) * 10) / 10;

  // Resilience score formula:
  // Starts at 100, drops with critical count and average network runway
  const penaltyFromCritical = criticalCount * 3.2;
  const penaltyFromLowRunway =
    avgNetworkDaysBuffer < 12 ? (12 - avgNetworkDaysBuffer) * 3.5 : 0;
  const networkResilienceScore = Math.max(
    12,
    Math.min(98, Math.round(100 - penaltyFromCritical - penaltyFromLowRunway))
  );

  return {
    simulatedInventory,
    totalShortages: criticalCount,
    criticalIncreaseCount: Math.max(0, criticalCount - baselineCriticalCount),
    newlyDeficientHospitals: newlyVulnerable,
    criticalMedicinesList: Array.from(criticalMedicinesSet),
    totalUnitsDeficit: totalDeficitUnits,
    networkResilienceScore,
    avgNetworkDaysBuffer,
    baselineCriticalCount,
  };
}
