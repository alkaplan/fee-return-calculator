import { useCalculator } from '../hooks/useCalculator.ts';
import { NumberInput } from './NumberInput.tsx';
import type { Offer, ManagementFeeBasis } from '../types/index.ts';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const updateOffer = useCalculator(s => s.updateOffer);
  const removeOffer = useCalculator(s => s.removeOffer);
  const duplicateOffer = useCalculator(s => s.duplicateOffer);
  const toggleAdvanced = useCalculator(s => s.toggleAdvanced);
  const toggleCollapsed = useCalculator(s => s.toggleCollapsed);
  const offerCount = useCalculator(s => s.offers.length);

  const update = (updates: Partial<Offer>) => updateOffer(offer.id, updates);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: offer.color }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <button
          onClick={() => toggleCollapsed(offer.id)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${offer.collapsed ? '' : 'rotate-90'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <input
          type="text"
          value={offer.name}
          onChange={(e) => update({ name: e.target.value })}
          className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-slate-300 transition-colors"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateOffer(offer.id)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          {offerCount > 1 && (
            <button
              onClick={() => removeOffer(offer.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!offer.collapsed && (
        <div className="p-4 space-y-4">
          {/* Core fields */}
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Price / Share"
              value={offer.pricePerShare}
              onChange={(v) => update({ pricePerShare: v })}
              prefix="$"
              min={0.01}
              step={1}
              tooltip="Price per share in this offer"
            />
            <NumberInput
              label="Management Fee"
              value={offer.managementFeePercent}
              onChange={(v) => update({ managementFeePercent: v })}
              suffix="%"
              min={0}
              max={20}
              step={0.1}
              tooltip="Annual management fee charged by the fund/SPV"
            />
            <NumberInput
              label="Carry / Performance Fee"
              value={offer.carryPercent}
              onChange={(v) => update({ carryPercent: v })}
              suffix="%"
              min={0}
              max={100}
              step={1}
              tooltip="Percentage of profits taken by the GP above the hurdle rate"
            />
            <NumberInput
              label="Hurdle Rate"
              value={offer.hurdleRatePercent}
              onChange={(v) => update({ hurdleRatePercent: v })}
              suffix="%"
              min={0}
              max={50}
              step={0.5}
              tooltip="Minimum annual return before carry kicks in (preferred return)"
            />
            <NumberInput
              label="Catch-up"
              value={offer.catchUpPercent}
              onChange={(v) => update({ catchUpPercent: v })}
              suffix="%"
              min={0}
              max={100}
              step={10}
              tooltip="Percentage of profits above hurdle allocated to GP during catch-up. 100% = full catch-up, 0% = no catch-up."
            />
            <NumberInput
              label="Setup Fee"
              value={offer.setupFee}
              onChange={(v) => update({ setupFee: v })}
              prefix="$"
              min={0}
              step={100}
              tooltip="One-time flat fee charged at setup (added to cash outlay)"
            />
            <NumberInput
              label="Placement Fee"
              value={offer.placementFeePercent}
              onChange={(v) => update({ placementFeePercent: v })}
              suffix="%"
              min={0}
              max={20}
              step={0.5}
              tooltip="Upfront fee as % of investment amount (added to cash outlay)"
            />
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => toggleAdvanced(offer.id)}
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${offer.showAdvanced ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
            Advanced
          </button>

          {offer.showAdvanced && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Management Fee Basis
                </label>
                <select
                  value={offer.managementFeeBasis}
                  onChange={(e) => update({ managementFeeBasis: e.target.value as ManagementFeeBasis })}
                  className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="committed">Committed Capital</option>
                  <option value="invested">Invested Capital</option>
                  <option value="nav">NAV</option>
                </select>
              </div>
              <NumberInput
                label="Admin Fee"
                value={offer.adminFee}
                onChange={(v) => update({ adminFee: v })}
                prefix={offer.adminFeeIsPercent ? undefined : '$'}
                suffix={offer.adminFeeIsPercent ? '%' : undefined}
                min={0}
                step={offer.adminFeeIsPercent ? 0.1 : 100}
                tooltip="Annual administrative fee (flat $ or % of investment)"
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-slate-500 pb-2">
                  <input
                    type="checkbox"
                    checked={offer.adminFeeIsPercent}
                    onChange={(e) => update({ adminFeeIsPercent: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                  />
                  Admin fee as %
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
