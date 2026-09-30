export type MedicineCategory =
  | 'Critical Care & Anesthesia'
  | 'Vasopressors & Emergency'
  | 'Antibiotics & Anti-Infectives'
  | 'Respiratory & Airway'
  | 'Anticoagulants & Hematology'
  | 'Metabolic & Endocrine';

export type StockStatus = 'critical' | 'warning' | 'stable' | 'surplus';

export type ExpiryRiskTier = 'expired' | 'critical_expiry' | 'moderate_expiry' | 'safe';

export interface BatchInfo {
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  expiryRiskTier: ExpiryRiskTier;
}

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  facilityType: 'Level I Trauma' | 'Academic Medical' | 'Pediatric Center' | 'Community Hospital' | 'Regional Trauma' | 'Rural Health Clinic';
  totalBeds: number;
  icuBeds: number;
  region: 'Metro Core' | 'North County' | 'East Valley' | 'South Bay' | 'West Foothills';
  coordinates: {
    lat: number;
    lng: number;
    x: number; // 0-100 relative for schematic map
    y: number; // 0-100 relative for schematic map
  };
  logisticsLead: string;
  contactPhone: string;
  dockHours: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: string;
  standardUnit: string;
  coldChainRequired: boolean;
  storageTemp: string;
  unitCostUsd: number;
  criticalBufferDays: number; // threshold below which is critical
  warningBufferDays: number;  // threshold below which is warning
  surplusBufferDays: number;  // threshold above which is candidate donor
}

export interface InventoryRecord {
  id: string;
  hospitalId: string;
  medicineId: string;
  currentStock: number;
  averageDailyConsumption: number;
  dailyConsumptionStdDev: number;
  consumptionTrend: 'increasing' | 'stable' | 'decreasing';
  trendPercent: number; // e.g. +18%, -5%
  batches: BatchInfo[];
  lastDeliveryDate: string;
  // Computed deterministically:
  daysToStockout: number;
  stockStatus: StockStatus;
  projectedStockoutDate: string;
  unitsExpiring30Days: number;
  unitsExpiring60Days: number;
  algorithmicRecommendation: string;
}

export interface TransferOpportunity {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineCategory: MedicineCategory;
  fromHospitalId: string;
  fromHospitalName: string;
  toHospitalId: string;
  toHospitalName: string;
  recommendedQuantity: number;
  distanceMiles: number;
  estTransitMinutes: number;
  urgency: 'immediate' | 'high' | 'routine';
  impactDaysGained: number; // recipient days-to-stockout added
  donorPreBufferDays: number; // donor starting days
  donorPostBufferDays: number; // donor remaining days of stock after transfer
  recipientPreBufferDays: number; // recipient starting days
  recipientPostBufferDays: number; // recipient new runway after transfer
  expiryUnitsSaved: number; // units expiring <30d salvaged
  coldChain: boolean;
  donorScore: number;
  scoringDetails: {
    stockSurplusScore: number;
    expiryBenefitScore: number;
    transitScore: number;
    recipientUrgencyScore: number;
  };
  rationale: string;
  status: 'suggested' | 'approved' | 'in_transit' | 'completed' | 'dismissed';
  createdAt: string;
  authorizedBy?: string;
  trackingNumber?: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  demandModifier: number; // e.g. 0.25 = +25%
  supplyDisruption: number; // e.g. -0.30 = -30% deliveries
  affectedCategories: MedicineCategory[] | 'all';
  epidemicFocalHospitals?: string[]; // IDs
}

export interface TransferLog {
  id: string;
  transferId: string;
  timestamp: string;
  medicineName: string;
  quantity: number;
  fromHospital: string;
  toHospital: string;
  authorizedBy: string;
  approverRole: string;
  status: 'Dispatched' | 'Delivered';
  notes: string;
  preDonorRunway: number;
  postDonorRunway: number;
  preRecipientRunway: number;
  postRecipientRunway: number;
  expiryUnitsSaved: number;
  transitMinutes: number;
}

export interface StructuredAnalysisResult {
  summary: string;
  key_findings: string[];
  priority_actions: string[];
  affected_facilities: string[];
  recommended_transfers: Array<{
    from: string;
    to: string;
    medicine: string;
    quantity: number;
    urgency: string;
    reason: string;
  }>;
  risks: string[];
  reasoning: string;
  assumptions: string[];
  timestamp: string;
  data_used_summary: string;
}

export interface CustomQueryResult {
  answer: string;
  data_citations: Array<{
    hospital: string;
    medicine: string;
    current_stock: number;
    daily_burn: number;
    stock_runway_days: number;
    metric_notes?: string;
  }>;
  recommendation: string;
  rationale: string;
  synthetic_disclaimer: string;
  timestamp: string;
}

export interface StressTestResult {
  scenario_summary: string;
  network_impact: string;
  newly_vulnerable_facilities: string[];
  critical_medicines: string[];
  recommended_interventions: string[];
  redistribution_plan: Array<{
    donor: string;
    recipient: string;
    medicine: string;
    units: number;
    impact: string;
  }>;
  top_risks: string[];
  reasoning: string;
  timestamp: string;
}

export type UserRole =
  | 'Director of Pharmacy Supply Chain'
  | 'Regional Health Logistics Officer'
  | 'Operations Analyst (Read-Only)';

export interface UserSession {
  name: string;
  role: UserRole;
  facility: string;
  hasDispatchAuthority: boolean;
  authenticated: boolean;
}
