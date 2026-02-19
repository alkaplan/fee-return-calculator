import { useCalculator } from './hooks/useCalculator.ts';
import { ScenarioInputs } from './components/ScenarioInputs.tsx';
import { OfferCard } from './components/OfferCard.tsx';
import { ComparisonTable } from './components/ComparisonTable.tsx';
import { FeeBreakdownChart } from './components/FeeBreakdownChart.tsx';
import { SensitivityChart } from './components/SensitivityChart.tsx';

function App() {
  const offers = useCalculator(s => s.offers);
  const addOffer = useCalculator(s => s.addOffer);
  const results = useCalculator(s => s.results);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Investment Fee Calculator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare investment offers side-by-side. See how fees impact your net returns.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 1. Scenario Setup */}
        <ScenarioInputs />

        {/* 2. Offers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Offers</h2>
            {offers.length < 5 && (
              <button
                onClick={addOffer}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Offer
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {offers.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* 3. Results */}
        {results.length > 0 && (
          <>
            <ComparisonTable />
            <FeeBreakdownChart />
            <SensitivityChart />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-400 text-center">
          For informational purposes only. Not financial advice. Verify calculations independently.
        </div>
      </footer>
    </div>
  );
}

export default App;
