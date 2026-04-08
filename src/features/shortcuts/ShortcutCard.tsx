import type { ShortcutItem } from "../../types/app";

type ShortcutCardProps = {
  item: ShortcutItem;
  copied: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
};

export const ShortcutCard = ({
  item,
  copied,
  onCopy,
  onEdit,
  onDelete,
  onToggleFavorite
}: ShortcutCardProps) => (
  <article className="theme-surface rounded-2xl border p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="theme-text text-sm font-semibold">{item.title}</h3>
          {item.favorite ? (
            <span className="theme-badge rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
              Favorito
            </span>
          ) : null}
        </div>
        {item.description ? (
          <p className="theme-text-muted mt-2 text-sm leading-5">
            {item.description}
          </p>
        ) : null}
      </div>
    </div>

    <pre className="theme-code mt-3 overflow-x-auto rounded-2xl px-3 py-3 font-['Cascadia_Code','Consolas',monospace] text-[13px] leading-6">
      <code>{item.command}</code>
    </pre>

    {item.tags.length ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="theme-surface rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] theme-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    ) : null}

    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onCopy}
        className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
          copied
            ? "theme-primary-btn"
            : "theme-ghost-btn"
        }`}
      >
        {copied ? "Copiado" : "Copiar"}
      </button>
      <button
        type="button"
        onClick={onToggleFavorite}
        className="theme-ghost-btn rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
      >
        {item.favorite ? "Desfavoritar" : "Favoritar"}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="theme-ghost-btn rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="theme-danger-btn rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
      >
        Remover
      </button>
    </div>
  </article>
);
