import { Download, LayoutDashboard, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnalysisContextForm } from "./components/AnalysisContextForm";
import { DashboardSummary } from "./components/DashboardSummary";
import { DetailList } from "./components/DetailList";
import { ExportActions } from "./components/ExportActions";
import { InputField } from "./components/InputField";
import { MetricGrid } from "./components/MetricGrid";
import { ModuleTabs } from "./components/ModuleTabs";
import { ResultTable } from "./components/ResultTable";
import { ScenarioComparison } from "./components/ScenarioComparison";
import { ScenarioManager } from "./components/ScenarioManager";
import { SectionCard } from "./components/SectionCard";
import { Button } from "./components/ui/Button";
import { modulesCatalog } from "./modules/catalog";
import type {
  AnalysisContext,
  DashboardMetric,
  ModuleResult,
  SavedScenario,
  SavedScenarioMap,
} from "./types/finance";
import { createEmptyAnalysisContext } from "./utils/analysisContext";
import { buildScenarioComparison } from "./utils/comparison";
import { formatCurrency } from "./utils/format";
import {
  createScenario,
  duplicateScenario,
  loadScenarioMap,
  removeScenario,
  updateScenario,
} from "./utils/scenarios";
import { exportAnalysisToXlsx, exportComparisonToXlsx } from "./utils/xlsx";

const initialInputs = Object.fromEntries(
  modulesCatalog.map((module) => [module.id, module.defaults]),
) as Record<string, Record<string, number>>;

const initialAnalysisContext = Object.fromEntries(
  modulesCatalog.map((module) => [module.id, createEmptyAnalysisContext()]),
) as Record<string, AnalysisContext>;

const getModuleConclusion = (moduleId: string, result: ModuleResult) => {
  const data = result.exportData as Record<string, unknown>;

  if (moduleId === "roi") {
    const roi = Number(data.roi ?? 0);
    return roi > 0
      ? "Con base en los datos ingresados, este escenario es viable y genera retorno positivo."
      : "Con base en los datos ingresados, este escenario es riesgoso porque no genera retorno positivo.";
  }

  if (moduleId === "business-feasibility") {
    const monthlyProfit = Number(data.monthlyProfit ?? 0);
    const annualReturn = Number(data.annualReturn ?? 0);

    if (monthlyProfit <= 0) {
      return "Con base en los datos ingresados, este escenario no es rentable con los supuestos actuales.";
    }

    return annualReturn >= 20
      ? "Con base en los datos ingresados, este escenario es viable y presenta una rentabilidad atractiva."
      : "Con base en los datos ingresados, este escenario es funcional pero todavia luce riesgoso por su retorno limitado.";
  }

  if (
    moduleId === "mortgage" ||
    moduleId === "bank-loan" ||
    moduleId === "auto-loan" ||
    moduleId === "credit-card"
  ) {
    const financeCost = Number(data.totalInterest ?? data.financeCost ?? 0);
    const baseAmount = Number(
      data.loanAmount ?? data.amount ?? data.vehiclePrice ?? data.balance ?? 1,
    );
    const ratio = baseAmount > 0 ? financeCost / baseAmount : 0;

    return ratio > 0.8
      ? "Con base en los datos ingresados, este escenario es riesgoso por el peso del costo financiero sobre el capital principal."
      : "Con base en los datos ingresados, este escenario es viable y mantiene una estructura financiera manejable.";
  }

  return `Con base en los datos ingresados, ${result.status.charAt(0).toLowerCase()}${result.status.slice(1)}.`;
};

const buildScenarioName = (moduleName: string, scenarioCount: number) =>
  `${moduleName} ${scenarioCount + 1}`;

function App() {
  const [activeModuleId, setActiveModuleId] = useState(modulesCatalog[0].id);
  const [inputs, setInputs] = useState(initialInputs);
  const [analysisContext, setAnalysisContext] = useState(initialAnalysisContext);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioMap>(() => loadScenarioMap());
  const [scenarioName, setScenarioName] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [comparisonIdsByModule, setComparisonIdsByModule] = useState<Record<string, string[]>>({});
  const [isExporting, setIsExporting] = useState(false);

  const activeModule = modulesCatalog.find((module) => module.id === activeModuleId)!;
  const moduleResults = useMemo(
    () =>
      Object.fromEntries(
        modulesCatalog.map((module) => [module.id, module.calculate(inputs[module.id])]),
      ),
    [inputs],
  );

  const activeResult = moduleResults[activeModuleId];
  const activeAnalysisContext = analysisContext[activeModuleId];
  const activeScenarios = savedScenarios[activeModuleId] ?? [];
  const activeComparisonIds = comparisonIdsByModule[activeModuleId] ?? [];
  const activeComparison = useMemo(() => {
    if (activeComparisonIds.length < 2) {
      return null;
    }

    const scenarioA = activeScenarios.find((scenario) => scenario.id === activeComparisonIds[0]);
    const scenarioB = activeScenarios.find((scenario) => scenario.id === activeComparisonIds[1]);

    if (!scenarioA || !scenarioB) {
      return null;
    }

    return buildScenarioComparison(activeModule, scenarioA, scenarioB);
  }, [activeComparisonIds, activeModule, activeScenarios]);

  useEffect(() => {
    const selectedScenario = activeScenarios.find((scenario) => scenario.id === selectedScenarioId);

    if (selectedScenario) {
      setScenarioName(selectedScenario.name);
      return;
    }

    setSelectedScenarioId(null);
    setScenarioName(buildScenarioName(activeModule.name, activeScenarios.length));
  }, [activeModule.name, activeScenarios, selectedScenarioId]);

  useEffect(() => {
    setComparisonIdsByModule((current) => ({
      ...current,
      [activeModuleId]: (current[activeModuleId] ?? []).filter((scenarioId) =>
        activeScenarios.some((scenario) => scenario.id === scenarioId),
      ),
    }));
  }, [activeModuleId, activeScenarios]);

  const dashboardMetrics = useMemo<DashboardMetric[]>(() => {
    const monthlyCommitment =
      Number(moduleResults.mortgage.summary[0].value) +
      Number(moduleResults["credit-card"].summary[0].value) +
      Number(moduleResults["bank-loan"].summary[0].value) +
      Number(moduleResults["auto-loan"].summary[1].value);

    const savingsGap = Number(moduleResults.savings.summary[2].value);
    const businessStatus = String(moduleResults["business-feasibility"].status);
    const projectedProfit = moduleResults["break-even"].details.find(
      (detail) => detail.label === "Utilidad proyectada",
    )?.value as number;

    return [
      {
        label: "Compromiso mensual clave",
        value: formatCurrency(monthlyCommitment),
        helper: "Vision consolidada de compromisos recurrentes para priorizar decisiones.",
      },
      {
        label: "Meta de ahorro",
        value: formatCurrency(savingsGap),
        helper: "Brecha o excedente frente al objetivo patrimonial trazado.",
      },
      {
        label: "Negocio preevaluado",
        value: businessStatus,
        helper: "Diagnostico ejecutivo a partir de ingresos y costos estimados.",
      },
      {
        label: "Utilidad por volumen",
        value: formatCurrency(projectedProfit),
        helper: "Proyeccion operativa derivada del punto de equilibrio.",
      },
    ];
  }, [moduleResults]);

  const activeConclusion = useMemo(
    () => getModuleConclusion(activeModuleId, activeResult),
    [activeModuleId, activeResult],
  );

  const handleFieldChange = (name: string, value: number) => {
    setInputs((current) => ({
      ...current,
      [activeModuleId]: {
        ...current[activeModuleId],
        [name]: Number.isFinite(value) ? value : 0,
      },
    }));
  };

  const handleToggleCompare = (scenario: SavedScenario) => {
    setComparisonIdsByModule((current) => {
      const currentIds = current[scenario.moduleId] ?? [];
      const isSelected = currentIds.includes(scenario.id);

      if (isSelected) {
        return {
          ...current,
          [scenario.moduleId]: currentIds.filter((scenarioId) => scenarioId !== scenario.id),
        };
      }

      return {
        ...current,
        [scenario.moduleId]: [...currentIds, scenario.id].slice(-2),
      };
    });
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setInputs((current) => ({
      ...current,
      [scenario.moduleId]: { ...scenario.inputs },
    }));
    setAnalysisContext((current) => ({
      ...current,
      [scenario.moduleId]: {
        ...scenario.context,
        tags: [...scenario.context.tags],
      },
    }));
    setActiveModuleId(scenario.moduleId);
    setSelectedScenarioId(scenario.id);
    setScenarioName(scenario.name);
  };

  const handleSaveScenario = () => {
    const nextName =
      scenarioName.trim() || buildScenarioName(activeModule.name, activeScenarios.length);
    const nextMap = createScenario(
      savedScenarios,
      activeModuleId,
      nextName,
      {
        ...inputs[activeModuleId],
      },
      {
        ...activeAnalysisContext,
        tags: [...activeAnalysisContext.tags],
      },
    );
    const createdScenario = nextMap[activeModuleId]?.[0] ?? null;

    setSavedScenarios(nextMap);
    setSelectedScenarioId(createdScenario?.id ?? null);
    setScenarioName(nextName);
  };

  const handleUpdateScenario = () => {
    if (!selectedScenarioId) {
      return;
    }

    const nextName = scenarioName.trim() || activeModule.name;
    const nextMap = updateScenario(
      savedScenarios,
      selectedScenarioId,
      nextName,
      { ...inputs[activeModuleId] },
      {
        ...activeAnalysisContext,
        tags: [...activeAnalysisContext.tags],
      },
    );

    setSavedScenarios(nextMap);
    setScenarioName(nextName);
  };

  const handleDuplicateScenario = (scenario: SavedScenario) => {
    setSavedScenarios(duplicateScenario(savedScenarios, scenario));
  };

  const handleDeleteScenario = (scenario: SavedScenario) => {
    setSavedScenarios(removeScenario(savedScenarios, scenario.id));

    if (scenario.id === selectedScenarioId) {
      setSelectedScenarioId(null);
    }
  };

  const handleExportModuleAnalysis = async () => {
    try {
      setIsExporting(true);
      const selectedScenario = activeScenarios.find((scenario) => scenario.id === selectedScenarioId);
      const exportScenarioName =
        selectedScenario?.name ?? (scenarioName.trim() || "Escenario actual");

      await exportAnalysisToXlsx({
        filename: `${activeModule.id}-${exportScenarioName.replace(/\s+/g, "-").toLowerCase()}`,
        moduleDefinition: activeModule,
        inputs: inputs[activeModule.id],
        result: activeResult,
        scenarioName: exportScenarioName,
        scenarioContext: activeAnalysisContext,
        conclusion: activeConclusion,
        comparison: activeComparison,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportComparison = async () => {
    if (!activeComparison) {
      return;
    }

    try {
      setIsExporting(true);
      await exportComparisonToXlsx({
        filename: `${activeModule.id}-comparacion-${activeComparison.scenarioA.name.replace(/\s+/g, "-").toLowerCase()}-vs-${activeComparison.scenarioB.name.replace(/\s+/g, "-").toLowerCase()}`,
        moduleDefinition: activeModule,
        comparison: activeComparison,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSummaryAnalysis = async () => {
    try {
      setIsExporting(true);
      await exportAnalysisToXlsx({
        filename: "stratify-resumen-general",
        moduleDefinition: activeModule,
        inputs: inputs[activeModule.id],
        result: activeResult,
        scenarioName: scenarioName.trim() || "Escenario actual",
        scenarioContext: activeAnalysisContext,
        conclusion: activeConclusion,
        comparison: activeComparison,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-grid px-4 py-6 text-ink md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(16,36,62,0.98),rgba(13,148,136,0.78))] p-8 text-white shadow-panel">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4" />
                Decision intelligence for planning, finance and business scenarios
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                Stratify
              </p>
              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                Decision Engine for Finance &amp; Business
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">
                Stratify transforma numeros en decisiones claras para personas y negocios.
                Analiza, simula y proyecta escenarios financieros con una vision estructurada y
                profesional.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                icon={<LayoutDashboard className="h-4 w-4" />}
                onClick={() => setActiveModuleId(modulesCatalog[0].id)}
              >
                Ir al primer modulo
              </Button>
              <Button
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
                onClick={handleExportSummaryAnalysis}
                disabled={isExporting}
              >
                {isExporting ? "Exportando..." : "Exportar analisis general"}
              </Button>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <DashboardSummary items={dashboardMetrics} />

          <SectionCard
            title="Centro de Decision"
            description="Selecciona un modulo para analizar escenarios financieros o evaluar decisiones de negocio."
            actions={
              <ExportActions
                onExportAnalysis={handleExportSummaryAnalysis}
                onExportComparison={activeComparison ? handleExportComparison : undefined}
                isExporting={isExporting}
              />
            }
          >
            <ModuleTabs
              modules={modulesCatalog}
              activeId={activeModuleId}
              onChange={setActiveModuleId}
            />
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_1.3fr]">
            <div className="space-y-6">
              <SectionCard
                title={activeModule.name}
                description={activeModule.description}
                accent={activeModule.accent}
                actions={
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setInputs((current) => ({
                        ...current,
                        [activeModule.id]: activeModule.defaults,
                      }))
                    }
                  >
                    Restaurar valores
                  </Button>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {activeModule.fields.map((field) => (
                    <InputField
                      key={field.name}
                      field={field}
                      value={inputs[activeModule.id][field.name]}
                      onChange={handleFieldChange}
                    />
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Contexto del analisis"
                description="Asocia el escenario con cliente, proyecto y lectura consultiva sin alterar el modelo financiero."
                accent={activeModule.accent}
              >
                <AnalysisContextForm
                  value={activeAnalysisContext}
                  onChange={(value) =>
                    setAnalysisContext((current) => ({
                      ...current,
                      [activeModule.id]: value,
                    }))
                  }
                />
              </SectionCard>

              <SectionCard
                title="Escenarios guardados"
                description="Administra versiones guardadas por modulo para comparar decisiones sin perder capturas anteriores."
                accent={activeModule.accent}
              >
                <ScenarioManager
                  moduleName={activeModule.name}
                  scenarioName={scenarioName}
                  onScenarioNameChange={setScenarioName}
                  scenarios={activeScenarios}
                  selectedScenarioId={selectedScenarioId}
                  comparisonIds={activeComparisonIds}
                  onToggleCompare={handleToggleCompare}
                  onSave={handleSaveScenario}
                  onUpdate={handleUpdateScenario}
                  onLoad={handleLoadScenario}
                  onDuplicate={handleDuplicateScenario}
                  onDelete={handleDeleteScenario}
                />
              </SectionCard>

              <SectionCard
                title="Comparacion de escenarios"
                description="Contrasta dos escenarios del mismo modulo para identificar variaciones de costo, retorno y sostenibilidad."
                accent={activeModule.accent}
              >
                <ScenarioComparison
                  moduleDefinition={activeModule}
                  scenarios={activeScenarios}
                  comparisonIds={activeComparisonIds}
                />
              </SectionCard>
            </div>

            <SectionCard
              title={activeResult.headline}
              description={activeResult.status}
              accent={activeModule.accent}
              actions={
                <ExportActions
                  onExportAnalysis={handleExportModuleAnalysis}
                  onExportComparison={activeComparison ? handleExportComparison : undefined}
                  compact
                  isExporting={isExporting}
                />
              }
            >
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="font-display text-xl text-ink">Resumen Ejecutivo</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Presentacion clara de metricas clave, totales, costos y resultados principales
                    para tomar una decision con rapidez.
                  </p>
                </div>

                <MetricGrid items={activeResult.summary} />
                <DetailList items={activeResult.details} />

                <div className="rounded-3xl border border-teal/20 bg-teal/10 p-4">
                  <h4 className="font-semibold text-teal">Conclusion automatica</h4>
                  <p className="mt-2 text-sm text-slate-700">{activeConclusion}</p>
                </div>

                <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="font-semibold text-ink">Resumen ejecutivo</h4>
                  {activeResult.insights.map((insight) => (
                    <p key={insight} className="text-sm text-slate-600">
                      {insight}
                    </p>
                  ))}
                </div>

                {activeResult.tables?.map((table) => (
                  <ResultTable key={table.title} table={table} />
                ))}
              </div>
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
