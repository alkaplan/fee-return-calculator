import { useCalculator } from '../hooks/useCalculator.ts';
import { NumberInput } from './NumberInput.tsx';
import type { PriceMode } from '../types/index.ts';

export function ScenarioInputs() {
  const scenario = useCalculator(s => s.scenario);
  const updateScenario = useCalculator(s => s.updateScenario);

  const isValuation = scenario.priceMode === 'valuation';
  const exitValuation = scenario.exitPricePerShare * scenario.sharesOutstanding;

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Exit Scenario</h2>
        <div className="flex items-center rounded-lg border border-slate-200 text-xs font-medium overflow-hidden">
          <button
            onClick={() => updateScenario({ priceMode: 'pps' as PriceMode })}
            className={`px-3 py-1.5 transition-colors ${!isValuation ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Price/Share
          </button>
          <button
            onClick={() => updateScenario({ priceMode: 'valuation' as PriceMode })}
            className={`px-3 py-1.5 transition-colors ${isValuation ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Valuation
          </button>
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-4 ${isValuation ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <NumberInput
          label="Investment Amount"
          value={scenario.investmentAmount}
          onChange={(v) => updateScenario({ investmentAmount: v })}
          prefix="$"
          min={1}
          tooltip="Total dollars of stock you're purchasing across all offers"
        />
        {isValuation ? (
          <>
            <NumberInput
              label="Shares Outstanding"
              value={scenario.sharesOutstanding}
              onChange={(v) => updateScenario({ sharesOutstanding: v })}
              min={1}
              tooltip="Total shares outstanding (used to convert between valuation and price/share)"
            />
            <NumberInput
              label="Exit Valuation"
              value={exitValuation}
              onChange={(v) => updateScenario({ exitPricePerShare: v / scenario.sharesOutstanding })}
              prefix="$"
              min={0}
              tooltip="Expected company valuation at exit"
            />
          </>
        ) : (
          <NumberInput
            label="Exit Price / Share"
            value={scenario.exitPricePerShare}
            onChange={(v) => updateScenario({ exitPricePerShare: v })}
            prefix="$"
            min={0.01}
            tooltip="Expected share price at exit (IPO, acquisition, secondary sale)"
          />
        )}
        <NumberInput
          label="Time Horizon"
          value={scenario.timeHorizon}
          onChange={(v) => updateScenario({ timeHorizon: v })}
          suffix="yrs"
          min={1}
          max={30}
          tooltip="Years until exit event"
        />
      </div>
    </section>
  );
}
