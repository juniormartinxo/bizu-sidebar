export type ShortcutItem = {
  id: string;
  title: string;
  command: string;
  description?: string;
  tags: string[];
  favorite: boolean;
};

export type NoteItem = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
};

export type ViewMode = "combined" | "notes" | "shortcuts";

export type ThemeMode = "system" | "light" | "dark";

export type AppSettings = {
  launchOnStartup: boolean;
  globalShortcut: string;
  defaultView: ViewMode;
  themeMode: ThemeMode;
};

export type AppData = {
  notes: NoteItem[];
  shortcuts: ShortcutItem[];
  settings: AppSettings;
};

export type NoteDraft = Pick<NoteItem, "title" | "content" | "pinned">;

export type ShortcutDraft = Pick<
  ShortcutItem,
  "title" | "command" | "description" | "tags" | "favorite"
>;
