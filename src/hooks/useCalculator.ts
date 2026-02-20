import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scenario, Offer, CalculationResult, SensitivityPoint } from '../types/index.ts';
import { calculateOfferFull } from '../lib/calculations.ts';
import { computeSensitivity } from '../lib/sensitivity.ts';
import { defaultScenario, defaultOffer, presetOfferA, presetOfferB, resetColorIndex } from '../lib/defaults.ts';

interface CalculatorState {
  scenario: Scenario;
  offers: Offer[];
  results: CalculationResult[];
  sensitivity: SensitivityPoint[];

  updateScenario: (updates: Partial<Scenario>) => void;
  addOffer: () => void;
  duplicateOffer: (id: string) => void;
  removeOffer: (id: string) => void;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  toggleAdvanced: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  recompute: () => void;
}

function makeInitialOffers(): Offer[] {
  resetColorIndex(0);
  const a = { ...defaultOffer('Fund A'), ...presetOfferA() };
  const b = { ...defaultOffer('Direct / No Fees'), ...presetOfferB() };
  return [a, b];
}

function recomputeResults(scenario: Scenario, offers: Offer[]) {
  const results = offers.map(o => calculateOfferFull(scenario, o));
  const sensitivity = computeSensitivity(scenario, offers);
  return { results, sensitivity };
}

export const useCalculator = create<CalculatorState>()(
  persist(
    (set, get) => ({
      scenario: defaultScenario(),
      offers: makeInitialOffers(),
      results: [],
      sensitivity: [],

      updateScenario: (updates) => {
        const scenario = { ...get().scenario, ...updates };
        const { results, sensitivity } = recomputeResults(scenario, get().offers);
        set({ scenario, results, sensitivity });
      },

      addOffer: () => {
        const offers = get().offers;
        if (offers.length >= 5) return;
        const newOffer = defaultOffer(`Offer ${String.fromCharCode(65 + offers.length)}`);
        const newOffers = [...offers, newOffer];
        const { results, sensitivity } = recomputeResults(get().scenario, newOffers);
        set({ offers: newOffers, results, sensitivity });
      },

      duplicateOffer: (id) => {
        const offers = get().offers;
        if (offers.length >= 5) return;
        const source = offers.find(o => o.id === id);
        if (!source) return;
        const dup = {
          ...source,
          id: crypto.randomUUID(),
          name: source.name + ' (copy)',
          color: defaultOffer('').color,
        };
        const newOffers = [...offers, dup];
        const { results, sensitivity } = recomputeResults(get().scenario, newOffers);
        set({ offers: newOffers, results, sensitivity });
      },

      removeOffer: (id) => {
        const offers = get().offers.filter(o => o.id !== id);
        if (offers.length === 0) return;
        const { results, sensitivity } = recomputeResults(get().scenario, offers);
        set({ offers, results, sensitivity });
      },

      updateOffer: (id, updates) => {
        const offers = get().offers.map(o => o.id === id ? { ...o, ...updates } : o);
        const { results, sensitivity } = recomputeResults(get().scenario, offers);
        set({ offers, results, sensitivity });
      },

      toggleAdvanced: (id) => {
        const offers = get().offers.map(o =>
          o.id === id ? { ...o, showAdvanced: !o.showAdvanced } : o
        );
        set({ offers });
      },

      toggleCollapsed: (id) => {
        const offers = get().offers.map(o =>
          o.id === id ? { ...o, collapsed: !o.collapsed } : o
        );
        set({ offers });
      },

      recompute: () => {
        const { scenario, offers } = get();
        const { results, sensitivity } = recomputeResults(scenario, offers);
        set({ results, sensitivity });
      },
    }),
    {
      name: 'fee-return-calculator',
      partialize: (state) => ({
        scenario: state.scenario,
        offers: state.offers,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate old persisted data missing new fields
          if (!state.scenario.priceMode) state.scenario.priceMode = 'pps';
          if (!state.scenario.sharesOutstanding) state.scenario.sharesOutstanding = 1_000_000;
          state.offers.forEach(o => {
            if (o.setupFeeIsPercent === undefined) o.setupFeeIsPercent = false;
          });

          if (state.offers.length > 0) {
            resetColorIndex(state.offers.length);
            const { results, sensitivity } = recomputeResults(state.scenario, state.offers);
            state.results = results;
            state.sensitivity = sensitivity;
          }
        }
      },
    }
  )
);
