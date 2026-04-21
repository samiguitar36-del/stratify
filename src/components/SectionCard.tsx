import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  accent?: string;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  accent = "from-sky/80 to-white",
}: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className={`mb-3 h-2 w-20 rounded-full bg-gradient-to-r ${accent}`} />
          <h3 className="font-display text-xl text-ink">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
