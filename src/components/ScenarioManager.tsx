import { Copy, GitCompareArrows, PencilLine, Save, Trash2, Upload } from "lucide-react";
import type { SavedScenario } from "../types/finance";
import { Button } from "./ui/Button";

interface ScenarioManagerProps {
  moduleName: string;
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  scenarios: SavedScenario[];
  selectedScenarioId: string | null;
  comparisonIds: string[];
  onToggleCompare: (scenario: SavedScenario) => void;
  onSave: () => void;
  onUpdate: () => void;
  onLoad: (scenario: SavedScenario) => void;
  onDuplicate: (scenario: SavedScenario) => void;
  onDelete: (scenario: SavedScenario) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatAnalysisDate = (value: string) => {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
};

export function ScenarioManager({
  moduleName,
  scenarioName,
  onScenarioNameChange,
  scenarios,
  selectedScenarioId,
  comparisonIds,
  onToggleCompare,
  onSave,
  onUpdate,
  onLoad,
  onDuplicate,
  onDelete,
}: ScenarioManagerProps) {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
      <div>
        <h4 className="font-display text-xl text-ink">Escenarios guardados</h4>
        <p className="mt-1 text-sm text-slate-600">
          Guarda versiones del analisis de {moduleName.toLowerCase()} para compararlas, retomarlas
          y presentarlas despues.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">Nombre del escenario</span>
          <input
            type="text"
            value={scenarioName}
            onChange={(event) => onScenarioNameChange(event.target.value)}
            placeholder="Ej. Escenario conservador Q2"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none ring-0 transition focus:border-ink"
          />
        </label>
        <div className="flex items-end">
          <Button variant="primary" onClick={onSave} icon={<Save className="h-4 w-4" />}>
            Guardar
          </Button>
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={onUpdate}
            icon={<PencilLine className="h-4 w-4" />}
            disabled={!selectedScenarioId}
            className={!selectedScenarioId ? "cursor-not-allowed opacity-50" : ""}
          >
            Actualizar
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500">
        Selecciona hasta dos escenarios para activar la comparacion ejecutiva del modulo.
      </div>

      <div className="space-y-3">
        {scenarios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-sm text-slate-500">
            Aun no hay escenarios guardados para este modulo.
          </div>
        ) : (
          scenarios.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            const isCompared = comparisonIds.includes(scenario.id);

            return (
              <div
                key={scenario.id}
                className={`rounded-2xl border p-4 ${
                  isSelected
                    ? "border-ink bg-white shadow-sm"
                    : "border-slate-200 bg-white/85"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{scenario.name}</p>
                      {isSelected ? (
                        <span className="rounded-full bg-ink px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          Activo
                        </span>
                      ) : null}
                      {isCompared ? (
                        <span className="rounded-full bg-teal/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal">
                          Comparacion
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Creado: {formatDate(scenario.createdAt)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Actualizado: {formatDate(scenario.updatedAt)}
                    </p>
                    <div className="mt-3 grid gap-1 text-xs text-slate-600">
                      <p>
                        <span className="font-semibold text-ink">Cliente:</span>{" "}
                        {scenario.context.clientName || "Sin definir"}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Proyecto:</span>{" "}
                        {scenario.context.projectName || "Sin definir"}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Responsable:</span>{" "}
                        {scenario.context.advisorName || "Sin definir"}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Fecha:</span>{" "}
                        {formatAnalysisDate(scenario.context.analysisDate)}
                      </p>
                      {scenario.context.tags.length > 0 ? (
                        <p>
                          <span className="font-semibold text-ink">Tags:</span>{" "}
                          {scenario.context.tags.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={isCompared ? "primary" : "secondary"}
                      onClick={() => onToggleCompare(scenario)}
                      icon={<GitCompareArrows className="h-4 w-4" />}
                    >
                      {isCompared ? "Quitar" : "Comparar"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onLoad(scenario)}
                      icon={<Upload className="h-4 w-4" />}
                    >
                      Cargar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDuplicate(scenario)}
                      icon={<Copy className="h-4 w-4" />}
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDelete(scenario)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
