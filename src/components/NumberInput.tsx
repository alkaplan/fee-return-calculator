import { useCallback, useState, useEffect } from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  className?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  tooltip,
  className = '',
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setLocalValue(String(value));
    }
  }, [value, focused]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed));
      onChange(clamped);
    }
  }, [onChange, min, max]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseFloat(localValue);
    if (isNaN(parsed)) {
      setLocalValue(String(value));
    } else {
      const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed));
      setLocalValue(String(clamped));
      onChange(clamped);
    }
  }, [localValue, value, onChange, min, max]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
        {label}
        {tooltip && <Tip text={tooltip} />}
      </label>
      <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-colors">
        {prefix && (
          <span className="pl-2.5 text-sm text-slate-400 select-none">{prefix}</span>
        )}
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          step={step}
          min={min}
          max={max}
          className="w-full px-2.5 py-2 text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pr-2.5 text-sm text-slate-400 select-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg whitespace-normal w-56 text-center">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

export { Tip as Tooltip };
