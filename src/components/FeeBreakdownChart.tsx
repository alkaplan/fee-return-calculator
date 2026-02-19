import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useCalculator } from '../hooks/useCalculator.ts';
import { formatCurrency, formatCurrencyFull } from '../lib/formatting.ts';

const FEE_COLORS = {
  setup: '#94a3b8',
  placement: '#64748b',
  management: '#6366f1',
  admin: '#8b5cf6',
  carry: '#f43f5e',
};

export function FeeBreakdownChart() {
  const results = useCalculator(s => s.results);

  if (results.length === 0) return null;

  const data = results.map(r => ({
    name: r.offerName,
    color: r.offerColor,
    'Setup Fee': r.feeBreakdown.setupFee,
    'Placement Fee': r.feeBreakdown.placementFee,
    'Management Fees': r.feeBreakdown.totalManagementFees,
    'Admin Fees': r.feeBreakdown.totalAdminFees,
    'Carry': r.feeBreakdown.carry,
  }));

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Fee Breakdown</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis
              tickFormatter={(v: number) => formatCurrency(v)}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Setup Fee" stackId="fees" fill={FEE_COLORS.setup}>
              {data.map((_, i) => <Cell key={i} />)}
            </Bar>
            <Bar dataKey="Placement Fee" stackId="fees" fill={FEE_COLORS.placement}>
              {data.map((_, i) => <Cell key={i} />)}
            </Bar>
            <Bar dataKey="Management Fees" stackId="fees" fill={FEE_COLORS.management}>
              {data.map((_, i) => <Cell key={i} />)}
            </Bar>
            <Bar dataKey="Admin Fees" stackId="fees" fill={FEE_COLORS.admin}>
              {data.map((_, i) => <Cell key={i} />)}
            </Bar>
            <Bar dataKey="Carry" stackId="fees" fill={FEE_COLORS.carry}>
              {data.map((_, i) => <Cell key={i} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
