export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(2) + 'M';
  }
  if (Math.abs(value) >= 10_000) {
    return '$' + (value / 1_000).toFixed(1) + 'K';
  }
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatCurrencyFull(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatPercent(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

export function formatPercentInput(value: number): string {
  return value.toFixed(1) + '%';
}

export function formatMOIC(value: number): string {
  return value.toFixed(2) + 'x';
}

export function formatIRR(value: number | null): string {
  if (value === null) return 'N/A';
  return (value * 100).toFixed(1) + '%';
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
