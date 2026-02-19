import type { Scenario, Offer, SensitivityPoint } from '../types/index.ts';
import { calculateOfferFull } from './calculations.ts';

export function computeSensitivity(
  scenario: Scenario,
  offers: Offer[],
  steps = 25,
): SensitivityPoint[] {
  const minPrice = scenario.exitPricePerShare * 0.25;
  const maxPrice = scenario.exitPricePerShare * 3;
  const stepSize = (maxPrice - minPrice) / steps;

  const points: SensitivityPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const exitPrice = minPrice + stepSize * i;
    const testScenario = { ...scenario, exitPricePerShare: exitPrice };

    const results: SensitivityPoint['results'] = {};

    for (const offer of offers) {
      const calc = calculateOfferFull(testScenario, offer);
      results[offer.id] = {
        netReturn: calc.netReturn,
        netMOIC: calc.netMOIC,
        netIRR: calc.netIRR,
      };
    }

    points.push({ exitPrice, results });
  }

  return points;
}
