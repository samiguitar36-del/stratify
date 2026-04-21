import type { ModuleDefinition } from "../types/finance";

interface ModuleTabsProps {
  modules: ModuleDefinition<Record<string, number>>[];
  activeId: string;
  onChange: (id: string) => void;
}

export function ModuleTabs({ modules, activeId, onChange }: ModuleTabsProps) {
  const personalModules = modules.filter((module) => module.category === "personal");
  const businessModules = modules.filter((module) => module.category === "business");

  const renderGroup = (
    title: string,
    description: string,
    groupModules: ModuleDefinition<Record<string, number>>[],
  ) => (
    <div className="space-y-3">
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {groupModules.map((module) => {
          const isActive = module.id === activeId;
          const Icon = module.icon;

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onChange(module.id)}
              className={`min-w-[210px] rounded-3xl border px-4 py-4 text-left transition ${
                isActive
                  ? "border-ink bg-ink text-white shadow-panel"
                  : "border-white/70 bg-white/75 text-ink hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-2xl p-3 ${isActive ? "bg-white/10" : "bg-mist"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{module.shortName}</p>
                  <p className={`text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>
                    {module.name}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderGroup(
        "Stratify Personal",
        "Herramientas para decisiones individuales, control financiero y planeacion patrimonial.",
        personalModules,
      )}
      {renderGroup(
        "Stratify Business",
        "Modelos para evaluar expansion, rentabilidad y escenarios de negocio con enfoque ejecutivo.",
        businessModules,
      )}
    </div>
  );
}
