export interface Scenario {
  investmentAmount: number;
  exitPricePerShare: number;
  timeHorizon: number;
}

export interface HurdleTier {
  id: string;
  moicFloor: number;
  moicCeiling: number;
  carryRate: number;
}

export type ManagementFeeBasis = 'committed' | 'invested' | 'nav';

export interface Offer {
  id: string;
  name: string;
  color: string;
  pricePerShare: number;
  managementFeePercent: number;
  carryPercent: number;
  hurdleRatePercent: number;
  catchUpPercent: number;
  setupFee: number;
  setupFeeIsPercent: boolean;
  placementFeePercent: number;
  // Advanced
  showAdvanced: boolean;
  managementFeeBasis: ManagementFeeBasis;
  hurdleTiers: HurdleTier[];
  adminFee: number;
  adminFeeIsPercent: boolean;
  // UI state
  collapsed: boolean;
}

export interface FeeBreakdown {
  setupFee: number;
  placementFee: number;
  totalManagementFees: number;
  totalAdminFees: number;
  carry: number;
}

export interface CalculationResult {
  offerId: string;
  offerName: string;
  offerColor: string;
  sharesAcquired: number;
  upfrontFees: number;
  totalCashOutlay: number;
  grossExitValue: number;
  grossProfit: number;
  grossMOIC: number;
  netExitValue: number;
  netReturn: number;
  netMOIC: number;
  netIRR: number | null;
  totalFees: number;
  effectiveFeeRate: number;
  breakEvenPrice: number;
  feeBreakdown: FeeBreakdown;
}

export interface SensitivityPoint {
  exitPrice: number;
  results: Record<string, { netReturn: number; netMOIC: number; netIRR: number | null }>;
}
