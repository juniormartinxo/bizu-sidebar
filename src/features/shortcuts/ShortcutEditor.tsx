import { useEffect, useState } from "react";
import type { ShortcutDraft, ShortcutItem } from "../../types/app";

type ShortcutEditorProps = {
  item?: ShortcutItem;
  mode: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (draft: ShortcutDraft) => void;
};

const toTagArray = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const ShortcutEditor = ({
  item,
  mode,
  onClose,
  onDelete,
  onSubmit
}: ShortcutEditorProps) => {
  const [title, setTitle] = useState(item?.title ?? "");
  const [command, setCommand] = useState(item?.command ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [tags, setTags] = useState(item?.tags.join(", ") ?? "");
  const [favorite, setFavorite] = useState(item?.favorite ?? false);

  useEffect(() => {
    setTitle(item?.title ?? "");
    setCommand(item?.command ?? "");
    setDescription(item?.description ?? "");
    setTags(item?.tags.join(", ") ?? "");
    setFavorite(item?.favorite ?? false);
  }, [item]);

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-end bg-black/50 backdrop-blur-sm">
      <div className="theme-panel flex h-full w-full max-w-[25rem] flex-col border-l shadow-shell">
        <div className="theme-border-soft border-b px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
            {mode === "create" ? "Novo atalho" : "Editar atalho"}
          </p>
          <h2 className="theme-text mt-2 text-lg font-semibold">
            {mode === "create" ? "Registrar comando util" : "Ajustar comando"}
          </h2>
        </div>

        <form
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !command.trim()) {
              return;
            }

            onSubmit({
              title,
              command,
              description,
              tags: toTagArray(tags),
              favorite
            });
          }}
        >
          <label className="space-y-2">
            <span className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">
              Titulo
            </span>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="theme-input w-full rounded-2xl px-3 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">
              Comando
            </span>
            <textarea
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="theme-input min-h-[8rem] w-full rounded-2xl px-3 py-3 font-['Cascadia_Code','Consolas',monospace] text-sm leading-6 outline-none focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">
              Descricao
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="theme-input min-h-[6rem] w-full rounded-2xl px-3 py-3 text-sm leading-6 outline-none focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">
              Tags
            </span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="git, build, deploy"
              className="theme-input w-full rounded-2xl px-3 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="theme-surface flex items-center gap-3 rounded-2xl border px-3 py-3">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(event) => setFavorite(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="theme-text-secondary text-sm">Marcar como favorito</span>
          </label>

          <div className="theme-border-soft mt-auto flex flex-wrap gap-2 border-t pt-4">
            <button
              type="submit"
              className="theme-primary-btn rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="theme-ghost-btn rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Fechar
            </button>
            {mode === "edit" && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="theme-danger-btn rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Excluir
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};
