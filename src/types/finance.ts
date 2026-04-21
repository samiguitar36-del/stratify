import type { LucideIcon } from "lucide-react";

export type FieldKind = "currency" | "percent" | "number";

export interface ModuleField {
  name: string;
  label: string;
  kind: FieldKind;
  min?: number;
  max?: number;
  step?: number;
  helper?: string;
}

export interface MetricItem {
  label: string;
  value: number | string;
  tone?: "primary" | "neutral" | "success" | "warning";
}

export interface DetailItem {
  label: string;
  value: number | string;
}

export interface ResultTable {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface ModuleResult {
  headline: string;
  status: string;
  summary: MetricItem[];
  details: DetailItem[];
  insights: string[];
  tables?: ResultTable[];
  exportData: Record<string, unknown>;
}

export interface ModuleDefinition<TInput extends Record<string, number>> {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  category: "personal" | "business";
  defaults: TInput;
  fields: ModuleField[];
  calculate(input: TInput): ModuleResult;
}

export interface DashboardMetric {
  label: string;
  value: string;
  helper: string;
}

export interface AnalysisContext {
  clientName: string;
  projectName: string;
  advisorName: string;
  analysisDate: string;
  executiveNotes: string;
  finalRecommendation: string;
  tags: string[];
}

export interface SavedScenario {
  id: string;
  name: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
  inputs: Record<string, number>;
  context: AnalysisContext;
}

export type SavedScenarioMap = Record<string, SavedScenario[]>;

export interface ComparisonMetricRow {
  key: string;
  label: string;
  scenarioAValue: number | string;
  scenarioBValue: number | string;
  differenceAbsolute: number | null;
  differencePercent: number | null;
  preferred: "higher" | "lower" | "neutral";
  betterScenario: "A" | "B" | "equal" | "none";
}

export interface ScenarioComparisonResult {
  scenarioA: SavedScenario;
  scenarioB: SavedScenario;
  inputs: ComparisonMetricRow[];
  metrics: ComparisonMetricRow[];
  conclusion: string;
}
