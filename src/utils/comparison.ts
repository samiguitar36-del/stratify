import type {
  ComparisonMetricRow,
  ModuleDefinition,
  SavedScenario,
  ScenarioComparisonResult,
} from "../types/finance";

const lowerIsBetterModules = new Set([
  "mortgage",
  "credit-card",
  "bank-loan",
  "auto-loan",
  "travel-budget",
  "break-even",
]);

const higherIsBetterKeywords = [
  "valor futuro",
  "roi",
  "utilidad",
  "retorno",
  "remanente",
  "excedente meta",
];

const lowerIsBetterKeywords = [
  "pago",
  "interés",
  "costo",
  "diferencia contra meta",
  "payback",
  "punto de equilibrio",
  "gasto estimado",
];

const getPreferredDirection = (moduleId: string, label: string): ComparisonMetricRow["preferred"] => {
  const normalizedLabel = label.toLowerCase();

  if (higherIsBetterKeywords.some((keyword) => normalizedLabel.includes(keyword))) {
    return "higher";
  }

  if (lowerIsBetterKeywords.some((keyword) => normalizedLabel.includes(keyword))) {
    return "lower";
  }

  if (lowerIsBetterModules.has(moduleId)) {
    return "lower";
  }

  return "neutral";
};

const getBetterScenario = (
  scenarioAValue: number,
  scenarioBValue: number,
  preferred: ComparisonMetricRow["preferred"],
): ComparisonMetricRow["betterScenario"] => {
  if (preferred === "neutral") {
    return scenarioAValue === scenarioBValue ? "equal" : "none";
  }

  if (scenarioAValue === scenarioBValue) {
    return "equal";
  }

  if (preferred === "higher") {
    return scenarioAValue > scenarioBValue ? "A" : "B";
  }

  return scenarioAValue < scenarioBValue ? "A" : "B";
};

const normalizeValue = (value: number | string) => {
  if (typeof value === "number") {
    return value;
  }

  const normalized = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : null;
};

const buildRow = (
  moduleId: string,
  key: string,
  label: string,
  scenarioAValue: number | string,
  scenarioBValue: number | string,
): ComparisonMetricRow => {
  const numericA = normalizeValue(scenarioAValue);
  const numericB = normalizeValue(scenarioBValue);
  const preferred = getPreferredDirection(moduleId, label);

  if (numericA === null || numericB === null) {
    return {
      key,
      label,
      scenarioAValue,
      scenarioBValue,
      differenceAbsolute: null,
      differencePercent: null,
      preferred,
      betterScenario: "none",
    };
  }

  const differenceAbsolute = numericB - numericA;
  const differencePercent = numericA === 0 ? null : (differenceAbsolute / Math.abs(numericA)) * 100;

  return {
    key,
    label,
    scenarioAValue,
    scenarioBValue,
    differenceAbsolute,
    differencePercent,
    preferred,
    betterScenario: getBetterScenario(numericA, numericB, preferred),
  };
};

const buildComparativeConclusion = (
  moduleId: string,
  scenarioA: SavedScenario,
  scenarioB: SavedScenario,
  metrics: ComparisonMetricRow[],
) => {
  const decisiveMetric = metrics.find((metric) => metric.betterScenario === "A" || metric.betterScenario === "B");

  if (!decisiveMetric) {
    return "Ambos escenarios muestran un perfil muy similar; conviene revisar supuestos estratégicos adicionales.";
  }

  const winner = decisiveMetric.betterScenario === "A" ? scenarioA.name : scenarioB.name;
  const loser = decisiveMetric.betterScenario === "A" ? scenarioB.name : scenarioA.name;
  const normalizedLabel = decisiveMetric.label.toLowerCase();

  if (moduleId === "roi") {
    return `${winner} ofrece mayor retorno proyectado, mientras que ${loser} conserva un perfil relativamente más prudente.`;
  }

  if (moduleId === "business-feasibility") {
    return `${winner} presenta una combinación más sólida de utilidad y recuperación esperada; ${loser} luce más sensible a los supuestos actuales.`;
  }

  if (normalizedLabel.includes("costo") || normalizedLabel.includes("interés") || normalizedLabel.includes("pago")) {
    return `${winner} presenta menor carga financiera total y se perfila como la alternativa más conservadora.`;
  }

  if (normalizedLabel.includes("utilidad") || normalizedLabel.includes("roi") || normalizedLabel.includes("valor futuro")) {
    return `${winner} entrega un resultado más atractivo en retorno o generación de valor, aunque ${loser} puede ser útil si se prioriza estabilidad.`;
  }

  return `${winner} parece el escenario más conveniente bajo los supuestos actuales, mientras que ${loser} exige mayor cautela.`;
};

export const buildScenarioComparison = (
  moduleDefinition: ModuleDefinition<Record<string, number>>,
  scenarioA: SavedScenario,
  scenarioB: SavedScenario,
): ScenarioComparisonResult => {
  const resultA = moduleDefinition.calculate(scenarioA.inputs);
  const resultB = moduleDefinition.calculate(scenarioB.inputs);

  const inputs = moduleDefinition.fields.map((field) =>
    buildRow(
      moduleDefinition.id,
      `input-${field.name}`,
      field.label,
      scenarioA.inputs[field.name],
      scenarioB.inputs[field.name],
    ),
  );

  const metrics = resultA.summary.map((item, index) =>
    buildRow(
      moduleDefinition.id,
      `metric-${index}-${item.label}`,
      item.label,
      item.value,
      resultB.summary[index]?.value ?? "",
    ),
  );

  return {
    scenarioA,
    scenarioB,
    inputs,
    metrics,
    conclusion: buildComparativeConclusion(moduleDefinition.id, scenarioA, scenarioB, metrics),
  };
};
