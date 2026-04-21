import type { AnalysisContext } from "../types/finance";
import { formatTagsInput, parseTagsInput } from "../utils/analysisContext";

interface AnalysisContextFormProps {
  value: AnalysisContext;
  onChange: (value: AnalysisContext) => void;
}

const updateField = (
  value: AnalysisContext,
  onChange: (nextValue: AnalysisContext) => void,
  field: keyof Omit<AnalysisContext, "tags">,
  fieldValue: string,
) => {
  onChange({
    ...value,
    [field]: fieldValue,
  });
};

export function AnalysisContextForm({ value, onChange }: AnalysisContextFormProps) {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
      <div>
        <h4 className="font-display text-xl text-ink">Contexto del analisis</h4>
        <p className="mt-1 text-sm text-slate-600">
          Documenta el cliente, el proyecto y la lectura consultiva para que cada escenario quede
          listo para seguimiento y presentacion.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">Cliente</span>
          <input
            type="text"
            value={value.clientName}
            onChange={(event) =>
              updateField(value, onChange, "clientName", event.target.value)
            }
            placeholder="Ej. Grupo Horizon"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">Proyecto</span>
          <input
            type="text"
            value={value.projectName}
            onChange={(event) =>
              updateField(value, onChange, "projectName", event.target.value)
            }
            placeholder="Ej. Expansion regional 2026"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">Responsable</span>
          <input
            type="text"
            value={value.advisorName}
            onChange={(event) =>
              updateField(value, onChange, "advisorName", event.target.value)
            }
            placeholder="Ej. Andrea Ramos"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">Fecha</span>
          <input
            type="date"
            value={value.analysisDate}
            onChange={(event) =>
              updateField(value, onChange, "analysisDate", event.target.value)
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Notas ejecutivas</span>
        <textarea
          value={value.executiveNotes}
          onChange={(event) =>
            updateField(value, onChange, "executiveNotes", event.target.value)
          }
          placeholder="Resumen consultivo, supuestos relevantes, riesgos y consideraciones clave."
          rows={4}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Recomendacion</span>
        <textarea
          value={value.finalRecommendation}
          onChange={(event) =>
            updateField(value, onChange, "finalRecommendation", event.target.value)
          }
          placeholder="Decision recomendada, siguiente paso o postura final para el cliente."
          rows={3}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Tags</span>
        <input
          type="text"
          value={formatTagsInput(value.tags)}
          onChange={(event) =>
            onChange({
              ...value,
              tags: parseTagsInput(event.target.value),
            })
          }
          placeholder="personal, negocio, inversion, prioridad alta"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
        />
        <p className="text-xs text-slate-500">
          Usa texto separado por comas para clasificar rapidamente el escenario.
        </p>
      </label>
    </div>
  );
}
