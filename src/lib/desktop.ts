import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  disable as disableAutostart,
  enable as enableAutostart,
  isEnabled as isAutostartEnabled
} from "@tauri-apps/plugin-autostart";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";

export const isTauriRuntime = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const copyCommandToClipboard = async (value: string) => {
  if (isTauriRuntime()) {
    try {
      await invoke("copy_text_to_clipboard", { text: value });
      return;
    } catch {
      await writeText(value);
      return;
    }
  }

  await navigator.clipboard.writeText(value);
};

export const alignSidebarWindow = async () => {
  if (!isTauriRuntime()) {
    return;
  }

  await invoke("align_main_window");
};

export const toggleSidebarWindow = async () => {
  if (!isTauriRuntime()) {
    return;
  }

  await invoke("toggle_main_window");
};

export const hideSidebarWindow = async () => {
  if (!isTauriRuntime()) {
    return;
  }

  await invoke("hide_main_window");
};

export const startSidebarDrag = async () => {
  if (!isTauriRuntime()) {
    return;
  }

  await getCurrentWindow().startDragging();
};

export const startSidebarVerticalResize = async () => {
  if (!isTauriRuntime()) {
    return;
  }

  await getCurrentWindow().startResizeDragging("South");
};

export const syncAutostart = async (enabled: boolean) => {
  if (!isTauriRuntime()) {
    return enabled;
  }

  if (enabled) {
    await enableAutostart();
  } else {
    await disableAutostart();
  }

  return isAutostartEnabled();
};

export const readAutostartState = async () => {
  if (!isTauriRuntime()) {
    return false;
  }

  return isAutostartEnabled();
};

export const registerToggleShortcut = async (
  accelerator: string,
  handler: () => void
) => {
  if (!isTauriRuntime()) {
    return { ok: false, message: "Atalhos globais so funcionam no app desktop." };
  }

  try {
    await unregisterAll();
    await register(accelerator, (event) => {
      if (event.state !== "Pressed") {
        return;
      }

      handler();
    });
    return { ok: true, message: `Atalho global ativo em ${accelerator}.` };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Nao foi possivel registrar o atalho global."
    };
  }
};
