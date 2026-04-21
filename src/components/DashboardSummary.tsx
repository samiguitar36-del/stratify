import type { DashboardMetric } from "../types/finance";

export function DashboardSummary({ items }: { items: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-panel"
        >
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-3 font-display text-3xl text-ink">{item.value}</p>
          <p className="mt-2 text-sm text-slate-600">{item.helper}</p>
        </div>
      ))}
    </div>
  );
}
