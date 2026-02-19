import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useCalculator } from '../hooks/useCalculator.ts';
import { formatCurrency, formatCurrencyFull, formatMOIC, formatPercent } from '../lib/formatting.ts';

type Metric = 'netReturn' | 'netMOIC' | 'netIRR';

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: 'netReturn', label: 'Net Return ($)' },
  { value: 'netMOIC', label: 'Net MOIC' },
  { value: 'netIRR', label: 'Net IRR' },
];

export function SensitivityChart() {
  const [metric, setMetric] = useState<Metric>('netReturn');
  const sensitivity = useCalculator(s => s.sensitivity);
  const offers = useCalculator(s => s.offers);
  const scenario = useCalculator(s => s.scenario);

  if (sensitivity.length === 0 || offers.length === 0) return null;

  const data = sensitivity.map(p => {
    const point: Record<string, number | null> = { exitPrice: p.exitPrice };
    for (const offer of offers) {
      const r = p.results[offer.id];
      if (r) {
        if (metric === 'netIRR') {
          point[offer.id] = r.netIRR !== null ? r.netIRR * 100 : null;
        } else {
          point[offer.id] = r[metric];
        }
      }
    }
    return point;
  });

  const formatY = (v: number) => {
    if (metric === 'netReturn') return formatCurrency(v);
    if (metric === 'netMOIC') return formatMOIC(v);
    return formatPercent(v / 100);
  };

  const refValue = metric === 'netReturn' ? 0 : metric === 'netMOIC' ? 1 : 0;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Sensitivity Analysis</h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {METRIC_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setMetric(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                metric === opt.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="exitPrice"
              tickFormatter={(v: number) => '$' + Math.round(v)}
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ value: 'Exit Price / Share', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={formatY}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip
              labelFormatter={(v) => 'Exit Price: $' + Math.round(v as number)}
              formatter={(value, name) => {
                if (value === null || value === undefined) return ['N/A', name];
                const v = value as number;
                if (metric === 'netReturn') return [formatCurrencyFull(v), name];
                if (metric === 'netMOIC') return [formatMOIC(v), name];
                return [formatPercent(v / 100), name];
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={refValue} stroke="#94a3b8" strokeDasharray="6 3" />
            <ReferenceLine
              x={scenario.exitPricePerShare}
              stroke="#94a3b8"
              strokeDasharray="6 3"
              label={{ value: 'Scenario', fontSize: 10, fill: '#94a3b8' }}
            />
            {offers.map(offer => (
              <Line
                key={offer.id}
                type="monotone"
                dataKey={offer.id}
                name={offer.name}
                stroke={offer.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
