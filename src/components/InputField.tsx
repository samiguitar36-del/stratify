import type { ChangeEvent } from "react";
import type { ModuleField } from "../types/finance";

interface InputFieldProps {
  field: ModuleField;
  value: number;
  onChange: (name: string, value: number) => void;
}

const kindPrefix: Record<ModuleField["kind"], string> = {
  currency: "$",
  percent: "%",
  number: "#",
};

const getPlaceholder = (field: ModuleField) => {
  if (field.kind === "currency") {
    return "Ej. 500000";
  }

  if (field.kind === "percent") {
    return "Ej. 12.5";
  }

  return "Ej. 24";
};

export function InputField({ field, value, onChange }: InputFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value === "" ? 0 : Number(event.target.value);
    onChange(field.name, Number.isFinite(nextValue) ? nextValue : 0);
  };

  const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(event.target.value);

    if (!Number.isFinite(rawValue)) {
      onChange(field.name, 0);
      return;
    }

    const clampedValue = Math.min(
      field.max ?? rawValue,
      Math.max(field.min ?? rawValue, rawValue),
    );

    if (clampedValue !== value) {
      onChange(field.name, clampedValue);
    }
  };

  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <span className="text-sm font-semibold text-ink">{field.label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-white bg-white px-3 py-2 shadow-sm transition focus-within:border-slate-300">
        <span className="text-sm font-bold text-slate-400">{kindPrefix[field.kind]}</span>
        <input
          type="number"
          value={value}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          onChange={handleChange}
          onBlur={handleBlur}
          inputMode="decimal"
          aria-label={field.label}
          placeholder={getPlaceholder(field)}
          className="w-full border-none bg-transparent text-base font-semibold text-ink outline-none placeholder:text-slate-300"
        />
      </div>
      <div className="space-y-1">
        {field.helper ? <span className="block text-xs text-slate-500">{field.helper}</span> : null}
        {field.min !== undefined || field.max !== undefined ? (
          <span className="block text-[11px] text-slate-400">
            Rango sugerido: {field.min ?? "sin minimo"} a {field.max ?? "sin maximo"}
          </span>
        ) : null}
      </div>
    </label>
  );
}
