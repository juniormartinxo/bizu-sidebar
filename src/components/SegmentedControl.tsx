import type { ViewMode } from "../types/app";

type SegmentedControlProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

const OPTIONS: Array<{ label: string; value: ViewMode }> = [
  { label: "Tudo", value: "combined" },
  { label: "Notas", value: "notes" },
  { label: "Atalhos", value: "shortcuts" }
];

export const SegmentedControl = ({ value, onChange }: SegmentedControlProps) => (
  <div className="theme-surface grid grid-cols-3 rounded-2xl border">
    {OPTIONS.map((option) => {
      const active = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
            active ? "theme-primary-btn" : "theme-text-muted hover:brightness-105"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
