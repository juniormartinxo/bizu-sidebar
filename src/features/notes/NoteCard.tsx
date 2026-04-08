import type { NoteItem } from "../../types/app";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type NoteCardProps = {
  note: NoteItem;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePinned: () => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));

export const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePinned
}: NoteCardProps) => (
  <article className="theme-surface rounded-2xl border p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="theme-text text-sm font-semibold">{note.title}</h3>
        <p className="theme-text-soft mt-1 text-[11px] uppercase tracking-[0.18em]">
          Atualizada em {formatDate(note.updatedAt)}
        </p>
      </div>
      {note.pinned ? (
        <span className="theme-badge rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
          Fixada
        </span>
      ) : null}
    </div>

    <div className="note-markdown theme-text-secondary mt-3 text-sm leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer noopener"
              className="theme-text"
            />
          )
        }}
      >
        {note.content}
      </ReactMarkdown>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onTogglePinned}
        className="theme-ghost-btn rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
      >
        {note.pinned ? "Desfixar" : "Fixar"}
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
