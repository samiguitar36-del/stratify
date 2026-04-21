import type { MetricItem } from "../types/finance";
import { formatMetricValue } from "../utils/format";

const toneStyles = {
  primary: "border-ink/10 bg-ink text-white",
  neutral: "border-slate-200 bg-slate-50 text-ink",
  success: "border-teal/20 bg-teal/10 text-teal",
  warning: "border-gold/20 bg-amber-50 text-amber-700",
};

const getMetricExplanation = (item: MetricItem) => {
  const label = item.label.toLowerCase();

  if (label.includes("mensual")) {
    return "Este valor te ayuda a dimensionar el compromiso periodico que asumirias.";
  }

  if (label.includes("total pagado")) {
    return "Resume el costo total del escenario, incluyendo capital e intereses cuando aplican.";
  }

  if (label.includes("interes") || label.includes("costo financiero")) {
    return "Muestra cuanto pagarias adicionalmente por financiar la decision.";
  }

  if (label.includes("roi") || label.includes("retorno")) {
    return "Indica si el rendimiento compensa el capital y el tiempo comprometidos.";
  }

  if (label.includes("ahorro") || label.includes("meta")) {
    return "Permite ver si el plan actual realmente te acerca al objetivo definido.";
  }

  if (label.includes("utilidad") || label.includes("ganancia")) {
    return "Te da una referencia directa del potencial economico del escenario.";
  }

  return "Lectura clave para evaluar si este escenario conviene antes de avanzar.";
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
          <p className="mt-3 text-2xl font-bold">{formatMetricValue(item.value, item.label)}</p>
          <p className="mt-2 text-xs leading-5 opacity-80">{getMetricExplanation(item)}</p>
        </div>
      ))}
    </div>
  );
}
