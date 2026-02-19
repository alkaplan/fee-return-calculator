/**
 * Newton-Raphson IRR solver for a series of cashflows.
 * cashflows[0] is at t=0, cashflows[1] at t=1, etc.
 */
export function solveIRR(cashflows: number[], maxIterations = 50, tolerance = 1e-7): number | null {
  if (cashflows.length < 2) return null;

  // Check if there's at least one sign change
  const hasPositive = cashflows.some(c => c > 0);
  const hasNegative = cashflows.some(c => c < 0);
  if (!hasPositive || !hasNegative) return null;

  let rate = 0.1; // initial guess

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashflows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashflows[t] / discountFactor;
      if (t > 0) {
        dnpv -= (t * cashflows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(dnpv) < 1e-12) {
      // Derivative too small, try bisection fallback
      return solveIRRBisection(cashflows);
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      // Guard against nonsensical results
      if (newRate < -0.99 || newRate > 100) return null;
      return newRate;
    }

    rate = newRate;

    // Guard against divergence
    if (rate < -0.99 || rate > 100 || !isFinite(rate)) {
      return solveIRRBisection(cashflows);
    }
  }

  // Newton didn't converge, try bisection
  return solveIRRBisection(cashflows);
}

function npvAtRate(cashflows: number[], rate: number): number {
  let npv = 0;
  for (let t = 0; t < cashflows.length; t++) {
    npv += cashflows[t] / Math.pow(1 + rate, t);
  }
  return npv;
}

function solveIRRBisection(cashflows: number[], maxIterations = 100, tolerance = 1e-7): number | null {
  let low = -0.5;
  let high = 10.0;

  const npvLow = npvAtRate(cashflows, low);
  const npvHigh = npvAtRate(cashflows, high);

  if (npvLow * npvHigh > 0) return null;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = npvAtRate(cashflows, mid);

    if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) {
      return mid;
    }

    if (npvMid * npvAtRate(cashflows, low) < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}
