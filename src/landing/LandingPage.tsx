import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const problems = [
  {
    title: "Creditos",
    description:
      "Evalua hipotecas, tarjetas, prestamos y financiamiento automotriz antes de comprometer flujo mensual.",
    icon: CreditCard,
  },
  {
    title: "Inversiones",
    description:
      "Compara retorno esperado, horizonte y aportaciones para decidir con una lectura mas clara del riesgo.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Negocios",
    description:
      "Analiza rentabilidad, punto de equilibrio y escenarios operativos antes de mover capital o expansion.",
    icon: BriefcaseBusiness,
  },
];

const steps = [
  {
    title: "Contexto",
    description:
      "Cada analisis se conecta con cliente, proyecto, responsable y objetivo de negocio.",
  },
  {
    title: "Analisis",
    description:
      "Stratify transforma inputs financieros en lectura ejecutiva, resultados y conclusiones accionables.",
  },
  {
    title: "Comparacion",
    description:
      "Contrasta escenarios para entender costo, retorno, conveniencia y riesgos de forma mas directa.",
  },
  {
    title: "Decision",
    description:
      "Genera una recomendacion clara y un reporte listo para compartir con cliente, socio o equipo.",
  },
];

const examples = [
  {
    title: "Cliente evaluando una hipoteca",
    description:
      "Determina si conviene el plazo actual, cuanto costara realmente el financiamiento y como mejorar la estructura del credito.",
  },
  {
    title: "Empresa comparando dos inversiones",
    description:
      "Contrasta retorno, horizonte y costo de oportunidad para decidir donde poner capital con mayor claridad.",
  },
  {
    title: "Negocio validando expansion",
    description:
      "Revisa si los ingresos esperados justifican costos, inversion inicial y nivel de riesgo operativo.",
  },
];

const benefits = [
  {
    title: "Mas claridad",
    description:
      "Convierte calculos dispersos en una lectura ejecutiva facil de entender y defender.",
    icon: BadgeCheck,
  },
  {
    title: "Mas ahorro",
    description:
      "Detecta costos evitables antes de firmar un credito, mover dinero o asumir un compromiso.",
    icon: Landmark,
  },
  {
    title: "Menor riesgo",
    description:
      "Ayuda a comparar alternativas y a tomar decisiones con mejor criterio financiero.",
    icon: ShieldCheck,
  },
];

const sectionTitleClass = "font-display text-3xl leading-tight text-ink md:text-4xl";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.12),transparent_35%),linear-gradient(180deg,#f7fbfd_0%,#edf3f8_100%)] text-ink">
      <header className="border-b border-white/70 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-ink px-3 py-2 text-sm font-bold text-white">
              Stratify
            </div>
            <p className="hidden text-sm text-slate-500 md:block">
              Decision intelligence for finance and business
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/app/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
            >
              Ver demo
            </a>
            <a
              href="/app/"
              className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173150]"
            >
              Entrar a la app
            </a>
            <a
              href="mailto:contacto@stratify.app"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
            >
              Contacto
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-4 py-2 text-sm font-medium text-teal">
                <Sparkles className="h-4 w-4" />
                Plataforma profesional de toma de decisiones
              </div>
              <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
                Toma decisiones financieras y de negocio con mas claridad.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Stratify ayuda a evaluar creditos, inversiones y escenarios de negocio con una
                lectura ejecutiva lista para cliente, socio o equipo directivo.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/app/"
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173150]"
                >
                  Ver demo
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/app/"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
                >
                  Entrar a la app
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(16,36,62,0.98),rgba(17,54,83,0.94))] p-6 text-white shadow-panel">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  Ejemplo de lectura
                </p>
                <h2 className="mt-3 font-display text-2xl">
                  Decision sustentada, no solo calculada
                </h2>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-white/70">Escenario</p>
                    <p className="mt-2 text-lg font-semibold">Credito hipotecario a 20 anos</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-white/70">Lectura</p>
                    <p className="mt-2 text-sm leading-6 text-white/90">
                      El escenario es viable, pero el costo financiero es alto. Conviene revisar
                      plazo y enganche antes de avanzar.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-teal/15 p-4">
                    <p className="text-sm text-teal-100">Resultado</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Reporte listo para cliente y comparacion entre escenarios
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-panel">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Que es Stratify
                </p>
                <h2 className={`mt-3 ${sectionTitleClass}`}>
                  Una plataforma para decidir mejor antes de comprometer dinero.
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-slate-600">
                <p>
                  Stratify no se limita a calcular. Organiza contexto, analiza escenarios,
                  compara alternativas y entrega una lectura mas util para decisiones reales.
                </p>
                <p>
                  Esta pensado para asesoria financiera, evaluacion de proyectos y conversaciones
                  con clientes donde importa tanto el numero como la recomendacion.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Problemas que resuelve
              </p>
              <h2 className={`mt-3 ${sectionTitleClass}`}>
                Desde decisiones personales hasta analisis de negocio.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {problems.map((problem) => {
                const Icon = problem.icon;
                return (
                  <article
                    key={problem.title}
                    className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-panel"
                  >
                    <div className="inline-flex rounded-2xl bg-mist p-3 text-ink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-ink">{problem.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {problem.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Como funciona
              </p>
              <h2 className={`mt-3 ${sectionTitleClass}`}>
                Un flujo simple para llevar un numero a una decision.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Paso {index + 1}
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Ejemplos
              </p>
              <h2 className={`mt-3 ${sectionTitleClass}`}>
                Escenarios reales donde la claridad cambia la decision.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {examples.map((example) => (
                <article
                  key={example.title}
                  className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-panel"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Building2 className="h-3.5 w-3.5" />
                    Caso de uso
                  </div>
                  <h3 className="mt-4 font-display text-2xl text-ink">{example.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{example.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(240,248,250,0.92))] p-8 shadow-panel">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Beneficios
              </p>
              <h2 className={`mt-3 ${sectionTitleClass}`}>
                Mas percepcion de valor para quien decide y para quien asesora.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="inline-flex rounded-2xl bg-teal/10 p-3 text-teal">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-ink">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {benefit.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:pb-24">
          <div className="mx-auto max-w-7xl rounded-[36px] border border-white/80 bg-[linear-gradient(135deg,rgba(16,36,62,0.98),rgba(13,148,136,0.8))] p-8 text-white shadow-panel md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
                  CTA
                </p>
                <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
                  Lleva tu analisis financiero a una experiencia mas profesional.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
                  Agenda una demo de Stratify o escribenos para explorar como usarlo con clientes,
                  evaluacion de inversiones o decisiones de negocio.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:contacto@stratify.app?subject=Quiero%20agendar%20una%20demo%20de%20Stratify"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100"
                >
                  Agenda demo
                </a>
                <a
                  href="mailto:contacto@stratify.app"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Contacto
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
