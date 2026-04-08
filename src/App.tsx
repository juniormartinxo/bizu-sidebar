import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { EmptyState } from "./components/EmptyState";
import { SearchField } from "./components/SearchField";
import { SectionBlock } from "./components/SectionBlock";
import { SegmentedControl } from "./components/SegmentedControl";
import { NoteCard } from "./features/notes/NoteCard";
import { NoteEditor } from "./features/notes/NoteEditor";
import { SettingsPanel } from "./features/settings/SettingsPanel";
import { ShortcutCard } from "./features/shortcuts/ShortcutCard";
import { ShortcutEditor } from "./features/shortcuts/ShortcutEditor";
import {
  alignSidebarWindow,
  copyCommandToClipboard,
  hideSidebarWindow,
  isTauriRuntime,
  readAutostartState,
  registerToggleShortcut,
  syncAutostart,
  toggleSidebarWindow
} from "./lib/desktop";
import { loadAppData, saveAppData } from "./lib/persistence";
import { useAppStore } from "./store/useAppStore";
import type { ThemeMode } from "./types/app";

const matchesText = (value: string, query: string) =>
  value.toLocaleLowerCase().includes(query);

function App() {
  const {
    data,
    activeView,
    query,
    editor,
    isHydrated,
    saveState,
    errorMessage,
    hydrate,
    setQuery,
    setView,
    openCreateNote,
    openEditNote,
    openCreateShortcut,
    openEditShortcut,
    closeEditor,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePinned,
    addShortcut,
    updateShortcut,
    deleteShortcut,
    toggleShortcutFavorite,
    setLaunchOnStartup,
    setGlobalShortcut,
    setThemeMode,
    setSaveState,
    setErrorMessage
  } = useAppStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [desktopStatus, setDesktopStatus] = useState<string | null>(null);
  const [systemTheme, setSystemTheme] = useState<Exclude<ThemeMode, "system">>(() =>
    window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
  );
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const desktop = isTauriRuntime();
  const resolvedTheme =
    data.settings.themeMode === "system" ? systemTheme : data.settings.themeMode;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const apply = (matches: boolean) => setSystemTheme(matches ? "light" : "dark");
    apply(media.matches);

    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const persisted = await loadAppData();
        if (!active) {
          return;
        }

        hydrate(persisted);

        if (desktop) {
          await alignSidebarWindow();
          const enabled = await readAutostartState();
          if (!active) {
            return;
          }
          setLaunchOnStartup(enabled);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao carregar os dados locais."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [desktop, hydrate, setErrorMessage, setLaunchOnStartup]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSaveState("saving");
        await saveAppData(data);
        setSaveState("saved");
      } catch (error) {
        setSaveState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao salvar os dados locais."
        );
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [data, isHydrated, setErrorMessage, setSaveState]);

  useEffect(() => {
    if (!desktop || !isHydrated) {
      return;
    }

    let active = true;

    void (async () => {
      const result = await registerToggleShortcut(data.settings.globalShortcut, () => {
        void toggleSidebarWindow();
      });

      if (!active) {
        return;
      }

      setDesktopStatus(result.message);
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setErrorMessage(null);
    })();

    return () => {
      active = false;
    };
  }, [data.settings.globalShortcut, desktop, isHydrated, setErrorMessage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (event.key === "/" && !isTypingTarget) {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
      }

      if (event.key === "Escape") {
        closeEditor();
        setSettingsOpen(false);
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "1") {
        event.preventDefault();
        setView("combined");
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "2") {
        event.preventDefault();
        setView("notes");
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "3") {
        event.preventDefault();
        setView("shortcuts");
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        openCreateShortcut();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCreateNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeEditor, openCreateNote, openCreateShortcut, setView]);

  useEffect(() => {
    if (!copiedId) {
      return;
    }

    const timer = window.setTimeout(() => setCopiedId(null), 1200);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const filteredNotes = useMemo(() => {
    if (!deferredQuery) {
      return data.notes;
    }

    return data.notes.filter((note) =>
      [note.title, note.content].some((value) => matchesText(value, deferredQuery))
    );
  }, [data.notes, deferredQuery]);

  const filteredShortcuts = useMemo(() => {
    if (!deferredQuery) {
      return data.shortcuts;
    }

    return data.shortcuts.filter((shortcut) =>
      [
        shortcut.title,
        shortcut.command,
        shortcut.description ?? "",
        ...shortcut.tags
      ].some((value) => matchesText(value, deferredQuery))
    );
  }, [data.shortcuts, deferredQuery]);

  const pinnedNotes = filteredNotes.filter((note) => note.pinned);
  const favoriteShortcuts = filteredShortcuts.filter((shortcut) => shortcut.favorite);
  const activeNote =
    editor?.kind === "note" && editor.id
      ? data.notes.find((note) => note.id === editor.id)
      : undefined;
  const activeShortcut =
    editor?.kind === "shortcut" && editor.id
      ? data.shortcuts.find((shortcut) => shortcut.id === editor.id)
      : undefined;

  const handleCopyShortcut = async (id: string, command: string) => {
    try {
      await copyCommandToClipboard(command);
      setCopiedId(id);
      setDesktopStatus("Comando copiado para a area de transferencia.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel copiar o comando."
      );
    }
  };

  const handleShortcutApply = async (value: string) => {
    const result = await registerToggleShortcut(value, () => {
      void toggleSidebarWindow();
    });

    setDesktopStatus(result.message);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setGlobalShortcut(value);
    setErrorMessage(null);
  };

  const handleThemeModeChange = async (value: ThemeMode) => {
    const nextData = {
      ...data,
      settings: {
        ...data.settings,
        themeMode: value
      }
    };

    setThemeMode(value);

    try {
      setSaveState("saving");
      await saveAppData(nextData);
      setSaveState("saved");
      setDesktopStatus("Tema salvo.");
      setErrorMessage(null);
    } catch (error) {
      setSaveState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar o tema."
      );
    }
  };

  const handleAutostartToggle = async (value: boolean) => {
    try {
      const enabled = await syncAutostart(value);
      setLaunchOnStartup(enabled);
      setDesktopStatus(
        enabled
          ? "Inicializacao automatica habilitada."
          : "Inicializacao automatica desabilitada."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel atualizar o autostart."
      );
    }
  };

  return (
    <>
      <AppShell
        saveState={saveState}
        shortcutLabel={data.settings.globalShortcut}
        onNewNote={openCreateNote}
        onNewShortcut={openCreateShortcut}
        onDockRight={() => {
          void alignSidebarWindow();
          setDesktopStatus("Sidebar reposicionada no lado direito.");
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onHide={() => {
          void hideSidebarWindow();
          setDesktopStatus("Aplicacao ocultada para a bandeja.");
        }}
      >
        <SearchField value={query} onChange={setQuery} />
        <SegmentedControl value={activeView} onChange={setView} />

        {errorMessage ? (
          <div className="theme-error rounded-2xl px-4 py-3 text-sm">{errorMessage}</div>
        ) : null}

        {(activeView === "combined" || activeView === "notes") && (
          <>
            {activeView === "combined" ? (
              <SectionBlock
                title="Favoritos"
                description="Notas fixadas e comandos favoritos."
                count={pinnedNotes.length + favoriteShortcuts.length}
              >
                {!pinnedNotes.length && !favoriteShortcuts.length ? (
                  <EmptyState
                    title="Nada marcado ainda"
                    description="Fixe notas e favorite comandos para montar sua area de consulta rapida."
                  />
                ) : (
                  <>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={() => openEditNote(note.id)}
                        onDelete={() => deleteNote(note.id)}
                        onTogglePinned={() => toggleNotePinned(note.id)}
                      />
                    ))}
                    {favoriteShortcuts.map((shortcut) => (
                      <ShortcutCard
                        key={shortcut.id}
                        item={shortcut}
                        copied={copiedId === shortcut.id}
                        onCopy={() => {
                          void handleCopyShortcut(shortcut.id, shortcut.command);
                        }}
                        onEdit={() => openEditShortcut(shortcut.id)}
                        onDelete={() => deleteShortcut(shortcut.id)}
                        onToggleFavorite={() => toggleShortcutFavorite(shortcut.id)}
                      />
                    ))}
                  </>
                )}
              </SectionBlock>
            ) : null}

            <SectionBlock
              title="Notas"
              description="Anotacoes curtas para consulta durante o trabalho."
              count={filteredNotes.length}
            >
              {filteredNotes.length ? (
                filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => openEditNote(note.id)}
                    onDelete={() => deleteNote(note.id)}
                    onTogglePinned={() => toggleNotePinned(note.id)}
                  />
                ))
              ) : (
                <EmptyState
                  title="Nenhuma nota encontrada"
                  description="Crie uma nota nova ou ajuste sua busca."
                />
              )}
            </SectionBlock>
          </>
        )}

        {(activeView === "combined" || activeView === "shortcuts") && (
          <SectionBlock
            title="Atalhos"
            description="Comandos reutilizaveis, com copia imediata e tags."
            count={filteredShortcuts.length}
          >
            {filteredShortcuts.length ? (
              filteredShortcuts.map((shortcut) => (
                <ShortcutCard
                  key={shortcut.id}
                  item={shortcut}
                  copied={copiedId === shortcut.id}
                  onCopy={() => {
                    void handleCopyShortcut(shortcut.id, shortcut.command);
                  }}
                  onEdit={() => openEditShortcut(shortcut.id)}
                  onDelete={() => deleteShortcut(shortcut.id)}
                  onToggleFavorite={() => toggleShortcutFavorite(shortcut.id)}
                />
              ))
            ) : (
              <EmptyState
                title="Nenhum atalho encontrado"
                description="Cadastre um comando util ou refine a busca."
              />
            )}
          </SectionBlock>
        )}
      </AppShell>

      {settingsOpen ? (
        <SettingsPanel
          currentShortcut={data.settings.globalShortcut}
          launchOnStartup={data.settings.launchOnStartup}
          themeMode={data.settings.themeMode}
          desktopStatus={desktopStatus}
          isDesktop={desktop}
          onClose={() => setSettingsOpen(false)}
          onThemeChange={(value) => {
            void handleThemeModeChange(value);
          }}
          onApplyShortcut={handleShortcutApply}
          onToggleAutostart={handleAutostartToggle}
        />
      ) : null}

      {editor?.kind === "note" ? (
        <NoteEditor
          item={activeNote}
          mode={editor.mode}
          onClose={closeEditor}
          onDelete={
            activeNote
              ? () => {
                  deleteNote(activeNote.id);
                }
              : undefined
          }
          onSubmit={(draft) => {
            if (editor.mode === "edit" && activeNote) {
              updateNote(activeNote.id, draft);
              return;
            }

            addNote(draft);
          }}
        />
      ) : null}

      {editor?.kind === "shortcut" ? (
        <ShortcutEditor
          item={activeShortcut}
          mode={editor.mode}
          onClose={closeEditor}
          onDelete={
            activeShortcut
              ? () => {
                  deleteShortcut(activeShortcut.id);
                }
              : undefined
          }
          onSubmit={(draft) => {
            if (editor.mode === "edit" && activeShortcut) {
              updateShortcut(activeShortcut.id, draft);
              return;
            }

            addShortcut(draft);
          }}
        />
      ) : null}
    </>
  );
}

export default App;
