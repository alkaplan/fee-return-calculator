import type { Scenario, Offer } from '../types/index.ts';

const OFFER_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6'];

let colorIndex = 0;

export function getNextColor(): string {
  const color = OFFER_COLORS[colorIndex % OFFER_COLORS.length];
  colorIndex++;
  return color;
}

export function resetColorIndex(count: number): void {
  colorIndex = count;
}

export function defaultScenario(): Scenario {
  return {
    investmentAmount: 100000,
    exitPricePerShare: 300,
    timeHorizon: 3,
  };
}

export function defaultOffer(name: string, id?: string): Offer {
  return {
    id: id ?? crypto.randomUUID(),
    name,
    color: getNextColor(),
    pricePerShare: 100,
    managementFeePercent: 0,
    carryPercent: 0,
    hurdleRatePercent: 0,
    catchUpPercent: 0,
    setupFee: 0,
    setupFeeIsPercent: false,
    placementFeePercent: 0,
    showAdvanced: false,
    managementFeeBasis: 'committed',
    hurdleTiers: [],
    adminFee: 0,
    adminFeeIsPercent: false,
    collapsed: false,
  };
}

export function presetOfferA(): Partial<Offer> {
  return {
    name: 'Fund A',
    pricePerShare: 100,
    managementFeePercent: 2,
    carryPercent: 20,
    hurdleRatePercent: 8,
    catchUpPercent: 100,
    setupFee: 0,
    placementFeePercent: 0,
  };
}

export function presetOfferB(): Partial<Offer> {
  return {
    name: 'Direct / No Fees',
    pricePerShare: 120,
    managementFeePercent: 0,
    carryPercent: 0,
    hurdleRatePercent: 0,
    catchUpPercent: 0,
    setupFee: 0,
    placementFeePercent: 0,
  };
}
