import type { ReactNode } from "react";

type SectionBlockProps = {
  title: string;
  description: string;
  count?: number;
  children: ReactNode;
};

export const SectionBlock = ({
  title,
  description,
  count,
  children
}: SectionBlockProps) => (
  <section className="theme-panel space-y-3 rounded-[26px] border p-4 shadow-panel">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="theme-text text-sm font-semibold uppercase tracking-[0.2em]">
          {title}
        </h2>
        <p className="theme-text-muted mt-1 text-xs">{description}</p>
      </div>
      {typeof count === "number" ? (
        <span className="theme-surface rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] theme-text-muted">
          {count}
        </span>
      ) : null}
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);
