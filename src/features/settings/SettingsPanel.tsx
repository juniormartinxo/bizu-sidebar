import { useEffect, useState } from "react";

import type { ThemeMode } from "../../types/app";

type SettingsPanelProps = {
  currentShortcut: string;
  launchOnStartup: boolean;
  themeMode: ThemeMode;
  desktopStatus: string | null;
  isDesktop: boolean;
  onClose: () => void;
  onThemeChange: (value: ThemeMode) => void;
  onApplyShortcut: (value: string) => Promise<void>;
  onToggleAutostart: (value: boolean) => Promise<void>;
};

export const SettingsPanel = ({
  currentShortcut,
  launchOnStartup,
  themeMode,
  desktopStatus,
  isDesktop,
  onClose,
  onThemeChange,
  onApplyShortcut,
  onToggleAutostart
}: SettingsPanelProps) => {
  const [shortcutDraft, setShortcutDraft] = useState(currentShortcut);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setShortcutDraft(currentShortcut);
  }, [currentShortcut]);

  return (
    <div className="fixed inset-0 z-20 flex items-stretch justify-end bg-black/45 backdrop-blur-sm">
      <div className="theme-panel flex h-full w-full flex-col border-l shadow-shell">
        <div className="theme-border-soft border-b px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
            Configuracoes
          </p>
          <h2 className="theme-text mt-2 text-lg font-semibold">Comportamento desktop</h2>
          <p className="theme-text-muted mt-2 text-sm leading-6">
            Ajustes do atalho global e inicializacao com o Windows.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <section className="theme-surface rounded-2xl border p-4">
            <div>
              <h3 className="theme-text text-sm font-semibold">Iniciar com o Windows</h3>
              <p className="theme-text-muted mt-1 text-xs leading-5">
                Controla o registro do aplicativo para abrir automaticamente.
              </p>
            </div>
            <label className="theme-surface-soft flex items-center gap-3 rounded-2xl border px-3 py-3">
              <input
                type="checkbox"
                checked={launchOnStartup}
                disabled={!isDesktop || busy}
                onChange={async (event) => {
                  setBusy(true);
                  try {
                    await onToggleAutostart(event.target.checked);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="h-4 w-4 accent-accent"
              />
              <span className="theme-text-secondary text-sm">
                {launchOnStartup ? "Ativado" : "Desativado"}
              </span>
            </label>
          </section>

          <section className="theme-surface rounded-2xl border p-4">
            <div>
              <h3 className="theme-text text-sm font-semibold">Tema</h3>
              <p className="theme-text-muted mt-1 text-xs leading-5">
                Escolha entre claro, escuro ou seguir o sistema operacional.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as const).map((option) => {
                const labels: Record<ThemeMode, string> = {
                  light: "Claro",
                  dark: "Escuro",
                  system: "Sistema"
                };

                const active = themeMode === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onThemeChange(option)}
                    className={`rounded-md px-3 py-3 mt-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      active ? "theme-primary-btn" : "theme-ghost-btn"
                    }`}
                  >
                    {labels[option]}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="theme-surface rounded-2xl border p-4">
            <div>
              <h3 className="theme-text text-sm font-semibold">Atalho global</h3>
              <p className="theme-text-muted mt-1 text-xs leading-5">
                Exemplo: <span className="font-mono">Ctrl+Shift+;</span>
              </p>
            </div>
            <input
              value={shortcutDraft}
              onChange={(event) => setShortcutDraft(event.target.value)}
              disabled={!isDesktop || busy}
              className="theme-input w-full rounded-2xl px-3 py-3 mt-1 text-sm outline-none focus:border-[color:var(--accent)]"
            />
            <button
              type="button"
              disabled={!isDesktop || busy || !shortcutDraft.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  await onApplyShortcut(shortcutDraft.trim());
                } finally {
                  setBusy(false);
                }
              }}
              className="theme-primary-btn rounded-md px-4 py-3 mt-1 text-xs font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Aplicar
            </button>
          </section>

          <section className="theme-surface rounded-2xl border p-4">
            <h3 className="theme-text text-sm font-semibold">Status</h3>
            <p className="theme-text-muted mt-2 text-sm leading-6">
              {desktopStatus ??
                (isDesktop
                  ? "Aguardando sincronizacao do ambiente desktop."
                  : "Modo web: tray, atalho global e autostart ficam indisponiveis fora do Tauri.")}
            </p>
          </section>
        </div>

        <div className="theme-border-soft border-t px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="theme-ghost-btn w-full rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
