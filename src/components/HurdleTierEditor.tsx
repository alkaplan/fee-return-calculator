import type { HurdleTier } from '../types/index.ts';
import { NumberInput } from './NumberInput.tsx';

interface HurdleTierEditorProps {
  tiers: HurdleTier[];
  onChange: (tiers: HurdleTier[]) => void;
}

export function HurdleTierEditor({ tiers, onChange }: HurdleTierEditorProps) {
  const addTier = () => {
    const lastCeiling = tiers.length > 0 ? tiers[tiers.length - 1].moicCeiling : 1;
    onChange([
      ...tiers,
      {
        id: crypto.randomUUID(),
        moicFloor: lastCeiling,
        moicCeiling: lastCeiling + 1,
        carryRate: 20,
      },
    ]);
  };

  const updateTier = (id: string, updates: Partial<HurdleTier>) => {
    onChange(tiers.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTier = (id: string) => {
    onChange(tiers.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-500">Escalating Hurdle Tiers</label>
      {tiers.map((tier) => (
        <div key={tier.id} className="flex items-end gap-2">
          <NumberInput
            label="MOIC Floor"
            value={tier.moicFloor}
            onChange={(v) => updateTier(tier.id, { moicFloor: v })}
            suffix="x"
            min={0}
            step={0.5}
            className="flex-1"
          />
          <NumberInput
            label="MOIC Ceiling"
            value={tier.moicCeiling}
            onChange={(v) => updateTier(tier.id, { moicCeiling: v })}
            suffix="x"
            min={0}
            step={0.5}
            className="flex-1"
          />
          <NumberInput
            label="Carry %"
            value={tier.carryRate}
            onChange={(v) => updateTier(tier.id, { carryRate: v })}
            suffix="%"
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <button
            onClick={() => removeTier(tier.id)}
            className="p-2 mb-0.5 text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addTier}
        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
      >
        + Add Tier
      </button>
    </div>
  );
}
