import type { Scenario, Offer, CalculationResult } from '../types/index.ts';
import { solveIRR } from './irr.ts';

/**
 * Compute the carry (performance fee) using a European waterfall:
 * 1. Return of capital
 * 2. Preferred return (hurdle) compounding annually
 * 3. Catch-up provision
 * 4. Carry on remaining profits
 */
function computeCarry(
  investmentAmount: number,
  grossProfit: number,
  hurdleRatePercent: number,
  catchUpPercent: number,
  carryPercent: number,
  timeHorizon: number,
): number {
  if (carryPercent <= 0 || grossProfit <= 0) return 0;

  const carryRate = carryPercent / 100;
  const hurdleRate = hurdleRatePercent / 100;
  const preferredReturn = hurdleRate > 0
    ? investmentAmount * (Math.pow(1 + hurdleRate, timeHorizon) - 1)
    : 0;

  if (grossProfit <= preferredReturn) return 0;

  const profitAboveHurdle = grossProfit - preferredReturn;

  if (catchUpPercent <= 0) {
    return profitAboveHurdle * carryRate;
  }

  // With catch-up: GP receives catchUpRate of profits above hurdle
  // until GP has received carryRate of total profits
  const catchUpRate = catchUpPercent / 100;
  const targetGPShare = grossProfit * carryRate;
  const catchUpAmount = targetGPShare / catchUpRate;

  if (profitAboveHurdle <= catchUpAmount) {
    return profitAboveHurdle * catchUpRate;
  }

  const remainingProfit = profitAboveHurdle - catchUpAmount;
  return catchUpAmount * catchUpRate + remainingProfit * carryRate;
}

function computeAnnualManagementFee(
  offer: Offer,
  investmentAmount: number,
  currentNAV: number,
): number {
  const rate = offer.managementFeePercent / 100;
  if (offer.managementFeeBasis === 'nav') {
    return currentNAV * rate;
  }
  return investmentAmount * rate;
}

function computeAnnualAdminFee(offer: Offer, investmentAmount: number): number {
  if (offer.adminFeeIsPercent) {
    return investmentAmount * (offer.adminFee / 100);
  }
  return offer.adminFee;
}

function computeCore(scenario: Scenario, offer: Offer) {
  const { investmentAmount, exitPricePerShare, timeHorizon } = scenario;

  const sharesAcquired = investmentAmount / offer.pricePerShare;
  const placementFee = investmentAmount * (offer.placementFeePercent / 100);
  const setupFee = offer.setupFeeIsPercent
    ? investmentAmount * (offer.setupFee / 100)
    : offer.setupFee;
  const upfrontFees = setupFee + placementFee;
  const totalCashOutlay = investmentAmount + upfrontFees;
  const grossExitValue = sharesAcquired * exitPricePerShare;

  let totalManagementFees = 0;
  let totalAdminFees = 0;

  for (let year = 1; year <= timeHorizon; year++) {
    const estimatedNAV = investmentAmount + (grossExitValue - investmentAmount) * (year / timeHorizon);
    totalManagementFees += computeAnnualManagementFee(offer, investmentAmount, estimatedNAV);
    totalAdminFees += computeAnnualAdminFee(offer, investmentAmount);
  }

  const grossProfit = grossExitValue - investmentAmount;
  const carry = computeCarry(
    investmentAmount, grossProfit, offer.hurdleRatePercent,
    offer.catchUpPercent, offer.carryPercent, timeHorizon,
  );

  const netExitValue = grossExitValue - totalManagementFees - totalAdminFees - carry;
  const netReturn = netExitValue - totalCashOutlay;
  const netMOIC = totalCashOutlay > 0 ? netExitValue / totalCashOutlay : 0;
  const grossMOIC = totalCashOutlay > 0 ? grossExitValue / totalCashOutlay : 0;

  // IRR cashflows
  const cashflows: number[] = [-totalCashOutlay];
  for (let year = 1; year < timeHorizon; year++) {
    const nav = investmentAmount + (grossExitValue - investmentAmount) * (year / timeHorizon);
    const annualFee = computeAnnualManagementFee(offer, investmentAmount, nav)
      + computeAnnualAdminFee(offer, investmentAmount);
    cashflows.push(-annualFee);
  }
  const finalNav = grossExitValue;
  const finalFees = computeAnnualManagementFee(offer, investmentAmount, finalNav)
    + computeAnnualAdminFee(offer, investmentAmount);
  cashflows.push(grossExitValue - finalFees - carry);

  const netIRR = solveIRR(cashflows);
  const totalFees = upfrontFees + totalManagementFees + totalAdminFees + carry;
  const effectiveFeeRate = grossProfit > 0 ? totalFees / grossProfit : 0;

  return {
    sharesAcquired, setupFee, upfrontFees, totalCashOutlay, grossExitValue,
    grossProfit, grossMOIC, netExitValue, netReturn, netMOIC, netIRR,
    totalFees, effectiveFeeRate, placementFee, totalManagementFees,
    totalAdminFees, carry,
  };
}

function findBreakEvenPrice(scenario: Scenario, offer: Offer): number {
  let low = 0;
  let high = offer.pricePerShare * 20;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const { netReturn } = computeCore({ ...scenario, exitPricePerShare: mid }, offer);
    if (Math.abs(netReturn) < 0.01) return mid;
    if (netReturn < 0) low = mid;
    else high = mid;
  }

  return (low + high) / 2;
}

export function calculateOfferFull(scenario: Scenario, offer: Offer): CalculationResult {
  const core = computeCore(scenario, offer);
  const breakEvenPrice = findBreakEvenPrice(scenario, offer);

  return {
    offerId: offer.id,
    offerName: offer.name,
    offerColor: offer.color,
    sharesAcquired: core.sharesAcquired,
    upfrontFees: core.upfrontFees,
    totalCashOutlay: core.totalCashOutlay,
    grossExitValue: core.grossExitValue,
    grossProfit: core.grossProfit,
    grossMOIC: core.grossMOIC,
    netExitValue: core.netExitValue,
    netReturn: core.netReturn,
    netMOIC: core.netMOIC,
    netIRR: core.netIRR,
    totalFees: core.totalFees,
    effectiveFeeRate: core.effectiveFeeRate,
    breakEvenPrice,
    feeBreakdown: {
      setupFee: core.setupFee,
      placementFee: core.placementFee,
      totalManagementFees: core.totalManagementFees,
      totalAdminFees: core.totalAdminFees,
      carry: core.carry,
    },
  };
}
