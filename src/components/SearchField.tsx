type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchField = ({ value, onChange }: SearchFieldProps) => (
  <label className="theme-input group flex items-center gap-3 rounded-2xl px-3 py-2 focus-within:border-[color:var(--accent)]">
    <span className="theme-text-soft text-xs font-semibold uppercase tracking-[0.18em]">
      Busca
    </span>
    <input
      id="global-search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="filtrar notas, comandos, tags"
      className="theme-text w-full bg-transparent text-sm outline-none"
    />
    <span className="theme-border theme-text-soft rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
      /
    </span>
  </label>
);
