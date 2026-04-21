import type { DetailItem } from "../types/finance";
import { formatMetricValue } from "../utils/format";

export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
        >
          <span className="text-sm text-slate-500">{item.label}</span>
          <span className="text-sm font-semibold text-ink">
            {formatMetricValue(item.value, item.label)}
          </span>
        </div>
      ))}
    </div>
  );
}
