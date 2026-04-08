import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile
} from "@tauri-apps/plugin-fs";
import { isTauriRuntime } from "./desktop";
import { createSampleData } from "./sampleData";
import type {
  AppData,
  AppSettings,
  NoteItem,
  ShortcutItem,
  ThemeMode,
  ViewMode
} from "../types/app";

const DATA_DIRECTORY = "state";
const DATA_FILE = `${DATA_DIRECTORY}/bizu-sidebar.json`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizeView = (value: unknown): ViewMode => {
  if (value === "notes" || value === "shortcuts" || value === "combined") {
    return value;
  }

  return "combined";
};

const sanitizeThemeMode = (value: unknown): ThemeMode => {
  if (value === "system" || value === "light" || value === "dark") {
    return value;
  }

  return "dark";
};

const sanitizeTags = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

const sanitizeShortcut = (value: unknown): ShortcutItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  if (typeof value.command !== "string") {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    command: value.command,
    description:
      typeof value.description === "string" ? value.description : undefined,
    tags: sanitizeTags(value.tags),
    favorite: Boolean(value.favorite)
  };
};

const sanitizeNote = (value: unknown): NoteItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.content !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    content: value.content,
    pinned: Boolean(value.pinned),
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString()
  };
};

const sanitizeSettings = (
  value: unknown,
  fallback: AppSettings
): AppSettings => {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    launchOnStartup:
      typeof value.launchOnStartup === "boolean"
        ? value.launchOnStartup
        : fallback.launchOnStartup,
    globalShortcut:
      typeof value.globalShortcut === "string" && value.globalShortcut.trim()
        ? value.globalShortcut.trim()
        : fallback.globalShortcut,
    defaultView: sanitizeView(value.defaultView),
    themeMode: sanitizeThemeMode(value.themeMode)
  };
};

export const normalizeAppData = (input: unknown): AppData => {
  const fallback = createSampleData();

  if (!isRecord(input)) {
    return fallback;
  }

  return {
    notes: Array.isArray(input.notes)
      ? input.notes
          .map(sanitizeNote)
          .filter((value): value is NoteItem => value !== null)
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      : fallback.notes,
    shortcuts: Array.isArray(input.shortcuts)
      ? input.shortcuts
          .map(sanitizeShortcut)
          .filter((value): value is ShortcutItem => value !== null)
      : fallback.shortcuts,
    settings: sanitizeSettings(input.settings, fallback.settings)
  };
};

export const loadAppData = async (): Promise<AppData> => {
  const fallback = createSampleData();

  if (!isTauriRuntime()) {
    return fallback;
  }

  await mkdir(DATA_DIRECTORY, {
    baseDir: BaseDirectory.AppLocalData,
    recursive: true
  });

  try {
    const raw = await readTextFile(DATA_FILE, {
      baseDir: BaseDirectory.AppLocalData
    });
    return normalizeAppData(JSON.parse(raw));
  } catch {
    await writeTextFile(DATA_FILE, JSON.stringify(fallback, null, 2), {
      baseDir: BaseDirectory.AppLocalData
    });
    return fallback;
  }
};

export const saveAppData = async (data: AppData) => {
  if (!isTauriRuntime()) {
    return;
  }

  await mkdir(DATA_DIRECTORY, {
    baseDir: BaseDirectory.AppLocalData,
    recursive: true
  });

  await writeTextFile(DATA_FILE, JSON.stringify(data, null, 2), {
    baseDir: BaseDirectory.AppLocalData
  });
};

export const getPersistenceLocationDescription = () =>
  "%APPDATA%/<identifier>/state/bizu-sidebar.json";
