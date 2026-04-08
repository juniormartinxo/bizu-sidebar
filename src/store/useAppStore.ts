import { create } from "zustand";
import { createSampleData } from "../lib/sampleData";
import type {
  AppData,
  NoteDraft,
  ShortcutDraft,
  ThemeMode,
  ViewMode
} from "../types/app";

type EditorState =
  | { kind: "note"; mode: "create" | "edit"; id?: string }
  | { kind: "shortcut"; mode: "create" | "edit"; id?: string }
  | null;

type SaveState = "idle" | "saving" | "saved" | "error";

type AppState = {
  data: AppData;
  activeView: ViewMode;
  query: string;
  editor: EditorState;
  isHydrated: boolean;
  saveState: SaveState;
  errorMessage: string | null;
  hydrate: (data: AppData) => void;
  setQuery: (query: string) => void;
  setView: (view: ViewMode) => void;
  openCreateNote: () => void;
  openEditNote: (id: string) => void;
  openCreateShortcut: () => void;
  openEditShortcut: (id: string) => void;
  closeEditor: () => void;
  addNote: (draft: NoteDraft) => void;
  updateNote: (id: string, draft: NoteDraft) => void;
  deleteNote: (id: string) => void;
  toggleNotePinned: (id: string) => void;
  addShortcut: (draft: ShortcutDraft) => void;
  updateShortcut: (id: string, draft: ShortcutDraft) => void;
  deleteShortcut: (id: string) => void;
  toggleShortcutFavorite: (id: string) => void;
  setLaunchOnStartup: (enabled: boolean) => void;
  setGlobalShortcut: (value: string) => void;
  setThemeMode: (value: ThemeMode) => void;
  setSaveState: (value: SaveState) => void;
  setErrorMessage: (value: string | null) => void;
};

const initialData = createSampleData();

const sortNotes = (notes: AppData["notes"]) =>
  [...notes].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

export const useAppStore = create<AppState>((set) => ({
  data: initialData,
  activeView: initialData.settings.defaultView,
  query: "",
  editor: null,
  isHydrated: false,
  saveState: "idle",
  errorMessage: null,
  hydrate: (data) =>
    set({
      data,
      activeView: data.settings.defaultView,
      isHydrated: true,
      errorMessage: null
    }),
  setQuery: (query) => set({ query }),
  setView: (view) =>
    set((state) => ({
      activeView: view,
      data: {
        ...state.data,
        settings: {
          ...state.data.settings,
          defaultView: view
        }
      }
    })),
  openCreateNote: () => set({ editor: { kind: "note", mode: "create" } }),
  openEditNote: (id) => set({ editor: { kind: "note", mode: "edit", id } }),
  openCreateShortcut: () =>
    set({ editor: { kind: "shortcut", mode: "create" } }),
  openEditShortcut: (id) =>
    set({ editor: { kind: "shortcut", mode: "edit", id } }),
  closeEditor: () => set({ editor: null }),
  addNote: (draft) =>
    set((state) => ({
      editor: null,
      data: {
        ...state.data,
        notes: sortNotes([
          {
            id: crypto.randomUUID(),
            title: draft.title.trim(),
            content: draft.content.trim(),
            pinned: draft.pinned,
            updatedAt: new Date().toISOString()
          },
          ...state.data.notes
        ])
      }
    })),
  updateNote: (id, draft) =>
    set((state) => ({
      editor: null,
      data: {
        ...state.data,
        notes: sortNotes(
          state.data.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  title: draft.title.trim(),
                  content: draft.content.trim(),
                  pinned: draft.pinned,
                  updatedAt: new Date().toISOString()
                }
              : note
          )
        )
      }
    })),
  deleteNote: (id) =>
    set((state) => ({
      editor:
        state.editor?.kind === "note" && state.editor.id === id ? null : state.editor,
      data: {
        ...state.data,
        notes: state.data.notes.filter((note) => note.id !== id)
      }
    })),
  toggleNotePinned: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        notes: sortNotes(
          state.data.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  pinned: !note.pinned,
                  updatedAt: new Date().toISOString()
                }
              : note
          )
        )
      }
    })),
  addShortcut: (draft) =>
    set((state) => ({
      editor: null,
      data: {
        ...state.data,
        shortcuts: [
          {
            id: crypto.randomUUID(),
            title: draft.title.trim(),
            command: draft.command.trim(),
            description: draft.description?.trim() || undefined,
            tags: draft.tags,
            favorite: draft.favorite
          },
          ...state.data.shortcuts
        ]
      }
    })),
  updateShortcut: (id, draft) =>
    set((state) => ({
      editor: null,
      data: {
        ...state.data,
        shortcuts: state.data.shortcuts.map((shortcut) =>
          shortcut.id === id
            ? {
                ...shortcut,
                title: draft.title.trim(),
                command: draft.command.trim(),
                description: draft.description?.trim() || undefined,
                tags: draft.tags,
                favorite: draft.favorite
              }
            : shortcut
        )
      }
    })),
  deleteShortcut: (id) =>
    set((state) => ({
      editor:
        state.editor?.kind === "shortcut" && state.editor.id === id
          ? null
          : state.editor,
      data: {
        ...state.data,
        shortcuts: state.data.shortcuts.filter((shortcut) => shortcut.id !== id)
      }
    })),
  toggleShortcutFavorite: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        shortcuts: state.data.shortcuts.map((shortcut) =>
          shortcut.id === id
            ? { ...shortcut, favorite: !shortcut.favorite }
            : shortcut
        )
      }
    })),
  setLaunchOnStartup: (enabled) =>
    set((state) => ({
      data: {
        ...state.data,
        settings: {
          ...state.data.settings,
          launchOnStartup: enabled
        }
      }
    })),
  setGlobalShortcut: (value) =>
    set((state) => ({
      data: {
        ...state.data,
        settings: {
          ...state.data.settings,
          globalShortcut: value
        }
      }
    })),
  setThemeMode: (value) =>
    set((state) => ({
      data: {
        ...state.data,
        settings: {
          ...state.data.settings,
          themeMode: value
        }
      }
    })),
  setSaveState: (value) => set({ saveState: value }),
  setErrorMessage: (value) => set({ errorMessage: value })
}));
