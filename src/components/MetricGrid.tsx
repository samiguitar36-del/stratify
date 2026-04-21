import type { MetricItem } from "../types/finance";
import { formatMetricValue } from "../utils/format";

const toneStyles = {
  primary: "border-ink/10 bg-ink text-white",
  neutral: "border-slate-200 bg-slate-50 text-ink",
  success: "border-teal/20 bg-teal/10 text-teal",
  warning: "border-gold/20 bg-amber-50 text-amber-700",
};

export function MetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-3xl border p-4 ${toneStyles[item.tone ?? "neutral"]}`}
        >
          <p className="text-sm opacity-80">{item.label}</p>
          <p className="mt-3 text-2xl font-bold">
            {formatMetricValue(item.value, item.label)}
          </p>
        </div>
      ))}
    </div>
  );
}
