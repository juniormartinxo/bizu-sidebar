import { useEffect, useState } from "react";
import type { NoteDraft, NoteItem } from "../../types/app";

type NoteEditorProps = {
  item?: NoteItem;
  mode: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (draft: NoteDraft) => void;
};

export const NoteEditor = ({
  item,
  mode,
  onClose,
  onDelete,
  onSubmit
}: NoteEditorProps) => {
  const [title, setTitle] = useState(item?.title ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [pinned, setPinned] = useState(item?.pinned ?? false);

  useEffect(() => {
    setTitle(item?.title ?? "");
    setContent(item?.content ?? "");
    setPinned(item?.pinned ?? false);
  }, [item]);

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-end bg-black/50 backdrop-blur-sm">
      <div className="theme-panel flex h-full w-full max-w-[25rem] flex-col border-l shadow-shell">
        <div className="theme-border-soft border-b px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
            {mode === "create" ? "Nova nota" : "Editar nota"}
          </p>
          <h2 className="theme-text mt-2 text-lg font-semibold">
            {mode === "create" ? "Registrar nota rapida" : "Ajustar conteudo"}
          </h2>
        </div>

        <form
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !content.trim()) {
              return;
            }

            onSubmit({
              title,
              content,
              pinned
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

          <label className="flex-1 space-y-2">
            <div className="space-y-1">
              <span className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">
                Conteudo
              </span>
              <p className="theme-text-soft text-xs">
                Aceita Markdown: titulos, listas, links, codigo e checklist.
              </p>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={
                "# Exemplo\n- Item 1\n- [ ] Revisar\n- [link](https://exemplo.com)"
              }
              className="theme-input min-h-[16rem] w-full rounded-2xl px-3 py-3 text-sm leading-6 outline-none focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="theme-surface flex items-center gap-3 rounded-2xl border px-3 py-3">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(event) => setPinned(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="theme-text-secondary text-sm">Fixar no topo</span>
          </label>

          <div className="theme-border-soft mt-auto flex flex-wrap gap-2 border-t pt-4">
            <button
              type="submit"
              className="theme-primary-btn rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="theme-ghost-btn rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Fechar
            </button>
            {mode === "edit" && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="theme-danger-btn rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
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
