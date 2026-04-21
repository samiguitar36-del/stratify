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
  A: "Mejor A",
  B: "Mejor B",
  equal: "Empate",
  none: "Referencia",
};

const ScenarioContextSummary = ({ scenario }: { scenario: SavedScenario }) => (
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
        Selecciona dos escenarios guardados de este modulo para activar la comparacion ejecutiva.
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

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
        La lectura compara los dos escenarios seleccionados y conserva la logica actual del
        modulo.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Escenario A
          </p>
          <h4 className="mt-2 font-display text-2xl text-ink">{comparison.scenarioA.name}</h4>
          <p className="mt-2 text-sm text-slate-600">
            Referencia base para la comparacion ejecutiva del modulo actual.
          </p>
          <ScenarioContextSummary scenario={comparison.scenarioA} />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Escenario B
          </p>
          <h4 className="mt-2 font-display text-2xl text-ink">{comparison.scenarioB.name}</h4>
          <p className="mt-2 text-sm text-slate-600">
            Alternativa comparada para identificar variaciones de costo, retorno o riesgo.
          </p>
          <ScenarioContextSummary scenario={comparison.scenarioB} />
        </div>
      </div>

      <ComparisonTable title="Inputs relevantes" data={comparison.inputs} />
      <ComparisonTable title="Resultados clave" data={comparison.metrics} />

      <div className="rounded-3xl border border-teal/20 bg-teal/10 p-5">
        <h4 className="font-semibold text-teal">Conclusion comparativa</h4>
        <p className="mt-2 text-sm text-slate-700">{comparison.conclusion}</p>
      </div>
    </div>
  );
}
