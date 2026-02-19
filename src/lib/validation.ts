import type { Scenario, Offer } from '../types/index.ts';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateScenario(s: Scenario): ValidationError[] {
  const errors: ValidationError[] = [];
  if (s.investmentAmount <= 0) errors.push({ field: 'investmentAmount', message: 'Must be positive' });
  if (s.exitPricePerShare <= 0) errors.push({ field: 'exitPricePerShare', message: 'Must be positive' });
  if (s.timeHorizon <= 0) errors.push({ field: 'timeHorizon', message: 'Must be positive' });
  if (s.timeHorizon > 30) errors.push({ field: 'timeHorizon', message: 'Max 30 years' });
  return errors;
}

export function validateOffer(o: Offer): ValidationError[] {
  const errors: ValidationError[] = [];
  if (o.pricePerShare <= 0) errors.push({ field: 'pricePerShare', message: 'Must be positive' });
  if (o.managementFeePercent < 0) errors.push({ field: 'managementFeePercent', message: 'Cannot be negative' });
  if (o.carryPercent < 0 || o.carryPercent > 100) errors.push({ field: 'carryPercent', message: '0-100%' });
  if (o.hurdleRatePercent < 0) errors.push({ field: 'hurdleRatePercent', message: 'Cannot be negative' });
  if (o.catchUpPercent < 0 || o.catchUpPercent > 100) errors.push({ field: 'catchUpPercent', message: '0-100%' });
  if (o.setupFee < 0) errors.push({ field: 'setupFee', message: 'Cannot be negative' });
  if (o.placementFeePercent < 0) errors.push({ field: 'placementFeePercent', message: 'Cannot be negative' });
  return errors;
}

export function isScenarioValid(s: Scenario): boolean {
  return validateScenario(s).length === 0;
}

export function isOfferValid(o: Offer): boolean {
  return validateOffer(o).length === 0;
}
