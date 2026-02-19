import { useMemo, useCallback } from 'react';
import { useCalculator } from '../hooks/useCalculator.ts';
import { formatCurrencyFull, formatMOIC, formatIRR, formatPercent, formatNumber } from '../lib/formatting.ts';
import type { CalculationResult } from '../types/index.ts';

type MetricRow = {
  label: string;
  key: string;
  format: (r: CalculationResult) => string;
  rawValue: (r: CalculationResult) => number;
  higherIsBetter: boolean;
  highlight: boolean;
};

const METRICS: MetricRow[] = [
  { label: 'Shares Acquired', key: 'shares', format: r => formatNumber(r.sharesAcquired, 1), rawValue: r => r.sharesAcquired, higherIsBetter: true, highlight: false },
  { label: 'Total Cash Outlay', key: 'outlay', format: r => formatCurrencyFull(r.totalCashOutlay), rawValue: r => r.totalCashOutlay, higherIsBetter: false, highlight: false },
  { label: 'Gross MOIC', key: 'gmoic', format: r => formatMOIC(r.grossMOIC), rawValue: r => r.grossMOIC, higherIsBetter: true, highlight: false },
  { label: 'Net MOIC', key: 'nmoic', format: r => formatMOIC(r.netMOIC), rawValue: r => r.netMOIC, higherIsBetter: true, highlight: true },
  { label: 'Net IRR', key: 'nirr', format: r => formatIRR(r.netIRR), rawValue: r => r.netIRR ?? -999, higherIsBetter: true, highlight: true },
  { label: 'Net Return', key: 'nret', format: r => formatCurrencyFull(r.netReturn), rawValue: r => r.netReturn, higherIsBetter: true, highlight: true },
  { label: 'Total Fees', key: 'fees', format: r => formatCurrencyFull(r.totalFees), rawValue: r => r.totalFees, higherIsBetter: false, highlight: false },
  { label: 'Effective Fee Rate', key: 'efr', format: r => formatPercent(r.effectiveFeeRate), rawValue: r => r.effectiveFeeRate, higherIsBetter: false, highlight: false },
  { label: 'Break-even Price', key: 'bep', format: r => '$' + formatNumber(r.breakEvenPrice, 2), rawValue: r => r.breakEvenPrice, higherIsBetter: false, highlight: false },
];

function findBestIndex(values: number[], higherIsBetter: boolean): number {
  if (values.length <= 1) return -1;
  let bestIdx = 0;
  for (let i = 1; i < values.length; i++) {
    if (higherIsBetter ? values[i] > values[bestIdx] : values[i] < values[bestIdx]) {
      bestIdx = i;
    }
  }
  // Only highlight if values differ
  const allSame = values.every(v => Math.abs(v - values[0]) < 0.001);
  return allSame ? -1 : bestIdx;
}

export function ComparisonTable() {
  const results = useCalculator(s => s.results);

  const copyAsTable = useCallback(() => {
    const headers = ['Metric', ...results.map(r => r.offerName)].join('\t');
    const rows = METRICS.map(m => {
      const cells = results.map(r => m.format(r));
      return [m.label, ...cells].join('\t');
    });
    const text = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(text);
  }, [results]);

  const deltaColumn = useMemo(() => {
    if (results.length !== 2) return null;
    return METRICS.map(m => {
      const a = m.rawValue(results[0]);
      const b = m.rawValue(results[1]);
      if (a === -999 || b === -999) return 'N/A';
      const diff = b - a;
      if (Math.abs(diff) < 0.001) return '--';
      const sign = diff > 0 ? '+' : '';
      if (m.key === 'nmoic' || m.key === 'gmoic') return `${sign}${diff.toFixed(2)}x`;
      if (m.key === 'nirr' || m.key === 'efr') return `${sign}${(diff * 100).toFixed(1)}%`;
      return `${sign}${formatCurrencyFull(diff)}`;
    });
  }, [results]);

  if (results.length === 0) return null;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Results Comparison</h2>
        <button
          onClick={copyAsTable}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy as Table
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-48">Metric</th>
              {results.map(r => (
                <th key={r.offerId} className="text-right px-4 py-3 font-medium" style={{ color: r.offerColor }}>
                  {r.offerName}
                </th>
              ))}
              {deltaColumn && (
                <th className="text-right px-4 py-3 font-medium text-slate-400">Delta</th>
              )}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, mIdx) => {
              const values = results.map(r => metric.rawValue(r));
              const bestIdx = findBestIndex(values, metric.higherIsBetter);

              return (
                <tr key={metric.key} className={metric.highlight ? 'bg-slate-50/50' : ''}>
                  <td className={`px-4 py-2.5 text-slate-600 ${metric.highlight ? 'font-semibold' : ''}`}>
                    {metric.label}
                  </td>
                  {results.map((r, rIdx) => (
                    <td
                      key={r.offerId}
                      className={`px-4 py-2.5 text-right tabular-nums ${
                        metric.highlight ? 'font-semibold' : ''
                      } ${rIdx === bestIdx ? 'text-emerald-600' : 'text-slate-800'}`}
                    >
                      {metric.format(r)}
                    </td>
                  ))}
                  {deltaColumn && (
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">
                      {deltaColumn[mIdx]}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
