import type { ReactNode } from "react";
import { startSidebarDrag, startSidebarVerticalResize } from "../lib/desktop";

type AppShellProps = {
  saveState: "idle" | "saving" | "saved" | "error";
  shortcutLabel: string;
  onNewNote: () => void;
  onNewShortcut: () => void;
  onDockRight: () => void;
  onOpenSettings: () => void;
  onHide: () => void;
  children: ReactNode;
};

const SAVE_STATE_LABEL: Record<AppShellProps["saveState"], string> = {
  idle: "Pronto",
  saving: "Salvando",
  saved: "Salvo",
  error: "Erro"
};

const AnchorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="2.25" />
    <path d="M12 7.5V19" />
    <path d="M8 11H5.5a6.5 6.5 0 0 0 13 0H16" />
    <path d="M8 19l4 3 4-3" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </svg>
);

export const AppShell = ({
  saveState,
  shortcutLabel,
  onNewNote,
  onNewShortcut,
  onDockRight,
  onOpenSettings,
  onHide,
  children
}: AppShellProps) => (
  <div className="theme-shell-gradient theme-text relative flex h-screen flex-col overflow-hidden">
    <div className="theme-overlay pointer-events-none absolute inset-0" />
    <header className="theme-border-soft relative border-b px-4 pb-4 pt-5 flex flex-col gap-2">
      <div
        className="mb-4 h-3 cursor-move rounded-full bg-white/40"
        onMouseDown={() => {
          void startSidebarDrag();
        }}
        title="Arraste para mover a janela"
        aria-hidden="true"
      />
      <div className="flex flex-col items-start justify-between gap-4">
        <div className="flex justify-between items-center gap-2 w-full">
          <span className="theme-surface rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] theme-text-secondary">
            {SAVE_STATE_LABEL[saveState]}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDockRight}
              title="Ancorar a direita"
              aria-label="Ancorar a direita"
              className="theme-ghost-btn flex h-9 w-9 items-center justify-center rounded-md transition hover:brightness-105"
            >
              <AnchorIcon />
            </button>
            <button
              type="button"
              onClick={onHide}
              title="Fechar para a bandeja"
              aria-label="Fechar para a bandeja"
              className="theme-ghost-btn flex h-9 w-9 items-center justify-center rounded-md transition hover:brightness-105"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div
          className="flex justify-between items-start cursor-move w-full"
          onMouseDown={() => {
            void startSidebarDrag();
          }}
        >
          <div className="">
            <h1 className="theme-text mt-1 font-['Bahnschrift','Segoe_UI_Variable_Text',sans-serif] text-2xl leading-none text-[color:var(--accent)]">
              Bizu
            </h1>
            <p className="text-[11px] font-semibold flex flex-col">
              <span className="uppercase tracking-[0.28em]">Sidebar de consulta</span>
              <span className="text-[9px] normal-case">
                Notas e comandos sempre ao alcance.
              </span>
            </p>
          </div>

          <div className="theme-text-muted text-xs flex flex-col items-end gap-0">
            <span className="font-bold">Atalho global:</span>
            <span className="py-1 px-2 rounded-md mt-3 bg-teal-900 text-teal-200">
              {shortcutLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onNewNote}
          className="theme-primary-btn rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:brightness-110"
        >
          Nota
        </button>
        <button
          type="button"
          onClick={onNewShortcut}
          className="theme-ghost-btn rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
        >
          Atalho
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="theme-ghost-btn rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition"
        >
          Config
        </button>
      </div>
    </header>

    <main className="relative flex-1 overflow-y-auto px-4 pb-6 pt-4">
      <div className="space-y-4">{children}</div>
    </main>

    <div
      className="theme-border-soft flex h-4 cursor-ns-resize items-center justify-center border-t"
      onMouseDown={() => {
        void startSidebarVerticalResize();
      }}
      title="Arraste para alterar a altura"
      aria-hidden="true"
    >
      <div className="h-1 w-14 rounded-full bg-[color:var(--text-soft)]/50" />
    </div>
  </div>
);
