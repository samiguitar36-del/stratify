import type { DetailItem } from "../types/finance";
import { formatMetricValue } from "../utils/format";

const getDetailExplanation = (item: DetailItem) => {
  const label = item.label.toLowerCase();

  if (label.includes("interes")) {
    return "Representa el costo adicional que pagarias sobre el monto original.";
  }

  if (label.includes("enganche")) {
    return "Un enganche mayor puede reducir el credito y bajar el costo financiero.";
  }

  if (label.includes("punto de equilibrio")) {
    return "Es el minimo que tendrias que vender para dejar de perder dinero.";
  }

  if (label.includes("margen")) {
    return "Este margen muestra cuanto espacio economico deja cada venta o escenario.";
  }

  if (label.includes("remanente") || label.includes("excedente")) {
    return "Te ayuda a ver si todavia tienes margen o ya estas presionando el presupuesto.";
  }

  if (label.includes("faltante") || label.includes("brecha")) {
    return "Este dato muestra cuanto tendrias que ajustar para cumplir el objetivo.";
  }

  if (label.includes("utilidad")) {
    return "Es la ganancia estimada despues de cubrir costos y compromisos principales.";
  }

  return "Dato complementario para sostener mejor la decision.";
};

export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">{item.label}</span>
            <span className="text-sm font-semibold text-ink">
              {formatMetricValue(item.value, item.label)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{getDetailExplanation(item)}</p>
        </div>
      ))}
    </div>
  );
}
