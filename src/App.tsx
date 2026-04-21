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

    if (roi >= 25) {
      return "Este escenario ofrece un retorno atractivo y justifica una revision mas profunda si el riesgo es aceptable para el cliente.";
    }

    if (roi > 0) {
      return "La inversion luce viable, aunque el retorno no es sobresaliente. Conviene revisar plazo, aportaciones o riesgo asumido antes de decidir.";
    }

    return "Con los supuestos actuales, el retorno no compensa el capital comprometido. Lo prudente seria replantear la inversion o ajustar expectativas.";
  }

  if (moduleId === "business-feasibility") {
    const monthlyProfit = Number(data.monthlyProfit ?? 0);
    const annualReturn = Number(data.annualReturn ?? 0);

    if (monthlyProfit <= 0) {
      return "Este escenario no sostiene la operacion con los supuestos actuales. Antes de avanzar, conviene ajustar ingresos, costos o el tamano de la inversion.";
    }

    if (annualReturn >= 20) {
      return "El escenario muestra una rentabilidad saludable y da senales de traccion. Puede ser una buena opcion si el cliente esta listo para ejecutar con disciplina.";
    }

    return "El negocio podria funcionar, pero el retorno aun es moderado. Recomendable afinar costos o acelerar ventas antes de comprometer mas capital.";
  }

  if (moduleId === "savings") {
    const gap = Number(data.gap ?? data.shortfall ?? 0);

    if (gap <= 0) {
      return "La estrategia actual parece suficiente para alcanzar la meta. Mantener consistencia en aportaciones sera mas importante que asumir riesgo extra.";
    }

    return "Con el ritmo actual todavia existe una brecha frente a la meta. Considera aumentar aportaciones, extender el plazo o ajustar el objetivo.";
  }

  if (moduleId === "travel-budget") {
    const remaining = Number(data.remainingBudget ?? data.bufferLeft ?? 0);

    if (remaining >= 0) {
      return "El viaje se mantiene dentro del presupuesto y deja cierto margen para imprevistos. Es un escenario razonablemente controlado.";
    }

    return "El plan actual rebasa el presupuesto. Lo recomendable es recortar categorias opcionales antes de confirmar gastos.";
  }

  if (moduleId === "break-even") {
    const projectedProfit = Number(data.projectedProfit ?? 0);

    if (projectedProfit > 0) {
      return "El volumen proyectado supera el punto de equilibrio y deja utilidad estimada. Aun asi, conviene validar que la demanda sea realista.";
    }

    return "Con el volumen actual, el negocio todavia no cubre su estructura de costos. La decision deberia esperar hasta fortalecer precio, margen o demanda.";
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

    if (ratio > 0.8) {
      return "Este escenario es posible, pero el costo financiero es alto. Valdria la pena reducir plazo, mejorar enganche o buscar una tasa mas competitiva.";
    }

    if (ratio > 0.45) {
      return "El financiamiento luce manejable, aunque ya implica un costo relevante. Es una opcion razonable si el flujo mensual del cliente puede sostenerla con holgura.";
    }

    return "El escenario mantiene un costo financiero controlado frente al capital solicitado. Se percibe como una opcion mas estable y defendible.";
  }

  return `Este escenario requiere validacion ejecutiva adicional, pero la lectura inicial sugiere que ${result.status.charAt(0).toLowerCase()}${result.status.slice(1)}.`;
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
        label: "Brecha de ahorro",
        value: formatCurrency(savingsGap),
        helper: "Muestra si el plan actual alcanza para llegar a la meta patrimonial.",
      },
      {
        label: "Lectura del negocio",
        value: businessStatus,
        helper: "Senal ejecutiva de rentabilidad inicial segun ingresos y costos esperados.",
      },
      {
        label: "Utilidad proyectada",
        value: formatCurrency(projectedProfit),
        helper: "Proyeccion operativa para entender si el volumen estimado deja margen real.",
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
                Stratify
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                Decision intelligence for finance and business
              </p>
              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                Toma decisiones financieras y de negocio con claridad
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">
                Analiza creditos, inversiones y escenarios antes de comprometer tu dinero.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Volver a la landing
              </a>
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
                {isExporting ? "Generando..." : "Descargar reporte para cliente"}
              </Button>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <DashboardSummary items={dashboardMetrics} />

          <SectionCard
            title="Selecciona el frente de decision"
            description="Elige un modulo para construir un analisis util, explicable y listo para compartir con cliente o equipo."
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
                title="1. Informacion del cliente / analisis"
                description="Primero define el contexto real de la decision para que el escenario tenga sentido consultivo."
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
                title="2. Inputs del escenario"
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
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                  Captura los supuestos clave que definen el escenario. Mientras mas realistas sean,
                  mas util sera la recomendacion final.
                </div>
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
                title="6. Acciones y seguimiento"
                description="Guarda, actualiza y compara escenarios para sostener una recomendacion con contexto."
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
                title="Comparacion para decidir mejor"
                description="Si comparas dos escenarios, Stratify destaca la alternativa mas conveniente de forma mas directa."
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
              title="3. Resumen ejecutivo"
              description="Lectura inicial del escenario para entender impacto, costo y conveniencia antes de profundizar."
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
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="font-display text-xl text-ink">Resumen Ejecutivo</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Esta vista sintetiza los numeros relevantes y los convierte en una lectura mas
                    util para tomar decisiones reales.
                  </p>
                </div>

                <MetricGrid items={activeResult.summary} />

                <div className="space-y-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <h4 className="font-semibold text-ink">4. Resultados detallados</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Aqui se explica el impacto economico del escenario con mayor detalle.
                    </p>
                  </div>
                  <DetailList items={activeResult.details} />
                </div>

                <div className="space-y-3">
                  <div className="rounded-3xl border border-teal/20 bg-teal/10 p-4">
                    <h4 className="font-semibold text-teal">5. Conclusion recomendada</h4>
                    <p className="mt-2 text-sm text-slate-700">{activeConclusion}</p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="font-semibold text-ink">Lectura ejecutiva</h4>
                  {activeResult.insights.map((insight) => (
                    <p key={insight} className="text-sm text-slate-600">
                      {insight}
                    </p>
                  ))}
                </div>

                {activeResult.tables?.length ? (
                  <div className="space-y-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <h4 className="font-semibold text-ink">Resultados de soporte</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        Tablas de apoyo para profundizar y respaldar la recomendacion.
                      </p>
                    </div>
                    {activeResult.tables.map((table) => (
                      <ResultTable key={table.title} table={table} />
                    ))}
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
