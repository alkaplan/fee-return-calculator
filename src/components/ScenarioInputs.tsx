import { useCalculator } from '../hooks/useCalculator.ts';
import { NumberInput } from './NumberInput.tsx';

export function ScenarioInputs() {
  const scenario = useCalculator(s => s.scenario);
  const updateScenario = useCalculator(s => s.updateScenario);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Exit Scenario</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberInput
          label="Investment Amount"
          value={scenario.investmentAmount}
          onChange={(v) => updateScenario({ investmentAmount: v })}
          prefix="$"
          min={1}
          step={1000}
          tooltip="Total dollars of stock you're purchasing across all offers"
        />
        <NumberInput
          label="Exit Price / Share"
          value={scenario.exitPricePerShare}
          onChange={(v) => updateScenario({ exitPricePerShare: v })}
          prefix="$"
          min={0.01}
          step={10}
          tooltip="Expected share price at exit (IPO, acquisition, secondary sale)"
        />
        <NumberInput
          label="Time Horizon"
          value={scenario.timeHorizon}
          onChange={(v) => updateScenario({ timeHorizon: v })}
          suffix="yrs"
          min={1}
          max={30}
          step={1}
          tooltip="Years until exit event"
        />
      </div>
    </section>
  );
}
