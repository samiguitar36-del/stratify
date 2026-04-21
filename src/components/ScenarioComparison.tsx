import type { ModuleDefinition, SavedScenario, ScenarioComparisonResult } from "../types/finance";
import { buildScenarioComparison } from "../utils/comparison";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

interface ScenarioComparisonProps {
  moduleDefinition: ModuleDefinition<Record<string, number>>;
  scenarios: SavedScenario[];
  comparisonIds: string[];
}

const formatDiff = (value: number | null) => {
  if (value === null) {
    return "N/D";
  }

  return formatCurrency(value);
};

const formatDiffPercent = (value: number | null) => {
  if (value === null) {
    return "N/D";
  }

  return formatPercent(value, 1);
};

const formatCell = (value: number | string, label: string) => {
  if (typeof value === "string") {
    return value;
  }

  const normalizedLabel = label.toLowerCase();

  if (
    normalizedLabel.includes("tasa") ||
    normalizedLabel.includes("roi") ||
    normalizedLabel.includes("%")
  ) {
    return formatPercent(value, 1);
  }

  if (
    normalizedLabel.includes("plazo") ||
    normalizedLabel.includes("mes") ||
    normalizedLabel.includes("ano") ||
    normalizedLabel.includes("unidad")
  ) {
    return formatNumber(value, 0);
  }

  return formatCurrency(value);
};

const badgeStyles = {
  A: "bg-teal/10 text-teal border-teal/20",
  B: "bg-amber-50 text-amber-700 border-amber-200",
  equal: "bg-slate-100 text-slate-600 border-slate-200",
  none: "bg-white text-slate-500 border-slate-200",
};

const badgeLabels = {
  A: "Mejor opcion",
  B: "Mejor opcion",
  equal: "Empate tecnico",
  none: "Referencia",
};

const getComparisonSignals = (comparison: ScenarioComparisonResult) => {
  const decisiveMetric = comparison.metrics.find(
    (metric) => metric.betterScenario === "A" || metric.betterScenario === "B",
  );

  const higherReturn = comparison.metrics.find((metric) => {
    const label = metric.label.toLowerCase();
    return (
      (label.includes("roi") ||
        label.includes("retorno") ||
        label.includes("rentabilidad") ||
        label.includes("utilidad")) &&
      (metric.betterScenario === "A" || metric.betterScenario === "B")
    );
  });

  const lowerCost = comparison.metrics.find((metric) => {
    const label = metric.label.toLowerCase();
    return (
      (label.includes("interes") ||
        label.includes("costo") ||
        label.includes("pago") ||
        label.includes("total pagado")) &&
      (metric.betterScenario === "A" || metric.betterScenario === "B")
    );
  });

  const higherRisk = comparison.metrics.find((metric) => {
    const label = metric.label.toLowerCase();
    return (
      (label.includes("interes") || label.includes("costo financiero")) &&
      (metric.betterScenario === "A" || metric.betterScenario === "B")
    );
  });

  return [
    decisiveMetric
      ? {
          label: "Mejor opcion",
          value:
            decisiveMetric.betterScenario === "A"
              ? comparison.scenarioA.name
              : comparison.scenarioB.name,
        }
      : null,
    higherReturn
      ? {
          label: "Mayor retorno",
          value:
            higherReturn.betterScenario === "A"
              ? comparison.scenarioA.name
              : comparison.scenarioB.name,
        }
      : null,
    lowerCost
      ? {
          label: "Menor costo",
          value:
            lowerCost.betterScenario === "A"
              ? comparison.scenarioA.name
              : comparison.scenarioB.name,
        }
      : null,
    higherRisk
      ? {
          label: "Mayor riesgo",
          value:
            higherRisk.betterScenario === "A"
              ? comparison.scenarioB.name
              : comparison.scenarioA.name,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
};

const ScenarioContextSummary = ({
  scenario,
  highlight,
}: {
  scenario: SavedScenario;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-3xl border p-5 ${highlight ? "border-teal/30 bg-teal/10" : "border-slate-200 bg-white"}`}
  >
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      {highlight ? "Escenario recomendado" : "Escenario en revision"}
    </p>
    <h4 className="mt-2 font-display text-2xl text-ink">{scenario.name}</h4>
    <div className="mt-3 grid gap-1 text-sm text-slate-600">
      <p>
        <span className="font-semibold text-ink">Cliente:</span>{" "}
        {scenario.context.clientName || "Sin definir"}
      </p>
      <p>
        <span className="font-semibold text-ink">Proyecto:</span>{" "}
        {scenario.context.projectName || "Sin definir"}
      </p>
      {scenario.context.tags.length > 0 ? (
        <p>
          <span className="font-semibold text-ink">Tags:</span> {scenario.context.tags.join(", ")}
        </p>
      ) : null}
    </div>
  </div>
);

const ComparisonTable = ({
  title,
  data,
}: {
  title: string;
  data: ScenarioComparisonResult["inputs"] | ScenarioComparisonResult["metrics"];
}) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-4 py-3">
      <h4 className="font-semibold text-ink">{title}</h4>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-mist text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Concepto</th>
            <th className="px-4 py-3 font-medium">Escenario A</th>
            <th className="px-4 py-3 font-medium">Escenario B</th>
            <th className="px-4 py-3 font-medium">Diferencia</th>
            <th className="px-4 py-3 font-medium">Variacion %</th>
            <th className="px-4 py-3 font-medium">Lectura</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.key} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
              <td className="px-4 py-3 text-ink">{formatCell(row.scenarioAValue, row.label)}</td>
              <td className="px-4 py-3 text-ink">{formatCell(row.scenarioBValue, row.label)}</td>
              <td className="px-4 py-3 text-ink">{formatDiff(row.differenceAbsolute)}</td>
              <td className="px-4 py-3 text-ink">{formatDiffPercent(row.differencePercent)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${badgeStyles[row.betterScenario]}`}
                >
                  {badgeLabels[row.betterScenario]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export function ScenarioComparison({
  moduleDefinition,
  scenarios,
  comparisonIds,
}: ScenarioComparisonProps) {
  if (comparisonIds.length < 2) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
        Selecciona dos escenarios guardados para obtener una lectura comparativa con recomendacion.
      </div>
    );
  }

  const scenarioA = scenarios.find((scenario) => scenario.id === comparisonIds[0]);
  const scenarioB = scenarios.find((scenario) => scenario.id === comparisonIds[1]);

  if (!scenarioA || !scenarioB) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
        La comparacion no esta disponible porque uno de los escenarios ya no existe.
      </div>
    );
  }

  const comparison = buildScenarioComparison(moduleDefinition, scenarioA, scenarioB);
  const signals = getComparisonSignals(comparison);
  const preferredScenario =
    comparison.metrics.find((metric) => metric.betterScenario === "A" || metric.betterScenario === "B")
      ?.betterScenario ?? "equal";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
        Compara ambos escenarios con una lectura orientada a decision. Stratify resalta la opcion
        mas conveniente segun costo, retorno y senales de riesgo disponibles.
      </div>

      {signals.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <div key={signal.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {signal.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">{signal.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ScenarioContextSummary scenario={comparison.scenarioA} highlight={preferredScenario === "A"} />
        <ScenarioContextSummary scenario={comparison.scenarioB} highlight={preferredScenario === "B"} />
      </div>

      <ComparisonTable title="Comparacion de inputs" data={comparison.inputs} />
      <ComparisonTable title="Comparacion de resultados" data={comparison.metrics} />

      <div className="rounded-3xl border border-teal/20 bg-teal/10 p-5">
        <h4 className="font-semibold text-teal">Lectura recomendada</h4>
        <p className="mt-2 text-sm text-slate-700">{comparison.conclusion}</p>
      </div>
    </div>
  );
}
