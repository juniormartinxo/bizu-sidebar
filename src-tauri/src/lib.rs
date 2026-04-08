use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, LogicalPosition, LogicalSize, Manager, Position, Size, WebviewWindow,
    WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;

const WINDOW_LABEL: &str = "main";
const SIDEBAR_WIDTH: f64 = 455.0;

fn align_window_to_sidebar(window: &WebviewWindow) -> tauri::Result<()> {
    let monitor = match window.current_monitor()? {
        Some(monitor) => monitor,
        None => window
            .primary_monitor()?
            .ok_or_else(|| tauri::Error::AssetNotFound("No monitor available".into()))?,
    };

    let scale_factor = monitor.scale_factor();
    let monitor_position = monitor.position().to_logical::<f64>(scale_factor);
    let monitor_size = monitor.size().to_logical::<f64>(scale_factor);
    let x = monitor_position.x + monitor_size.width - SIDEBAR_WIDTH;

    window.set_size(Size::Logical(LogicalSize::new(SIDEBAR_WIDTH, monitor_size.height)))?;
    window.set_position(Position::Logical(LogicalPosition::new(x, monitor_position.y)))?;

    Ok(())
}

fn main_window(app: &AppHandle) -> Result<WebviewWindow, String> {
    app.get_webview_window(WINDOW_LABEL)
        .ok_or_else(|| "Janela principal nao encontrada.".to_string())
}

fn toggle_window_visibility(app: &AppHandle) -> Result<(), String> {
    let window = main_window(app)?;
    let visible = window.is_visible().map_err(|error| error.to_string())?;

    if visible {
        hide_window(&window)?;
    } else {
        window.show().map_err(|error| error.to_string())?;
        window
            .set_focus()
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}

fn hide_window(window: &WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|error| error.to_string())
}

fn build_tray(app: &App) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(app, "toggle", "Mostrar / Ocultar", true, None::<&str>)?;
    let dock = MenuItem::with_id(app, "dock-right", "Ancorar a direita", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &dock, &quit])?;

    let tray_icon = Image::from_bytes(include_bytes!("../icons/tray-icon.png"))?;

    TrayIconBuilder::with_id("bizu-tray")
        .tooltip("Bizu Sidebar")
        .icon(tray_icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app_handle, event| match event.id.as_ref() {
            "toggle" => {
                let _ = toggle_window_visibility(&app_handle);
            }
            "dock-right" => {
                if let Ok(window) = main_window(&app_handle) {
                    let _ = align_window_to_sidebar(&window);
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app_handle.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let _ = toggle_window_visibility(&tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
fn toggle_main_window(app: AppHandle) -> Result<(), String> {
    toggle_window_visibility(&app)
}

#[tauri::command]
fn align_main_window(app: AppHandle) -> Result<(), String> {
    let window = main_window(&app)?;
    align_window_to_sidebar(&window).map_err(|error| error.to_string())
}

#[tauri::command]
fn hide_main_window(app: AppHandle) -> Result<(), String> {
    let window = main_window(&app)?;
    hide_window(&window)
}

#[tauri::command]
fn copy_text_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = arboard::Clipboard::new().map_err(|error| error.to_string())?;
    clipboard
        .set_text(text)
        .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .on_window_event(|window, event| {
            if window.label() != WINDOW_LABEL {
                return;
            }

            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .setup(|app| {
            app.handle()
                .plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    None::<Vec<&str>>,
                ))?;

            build_tray(app)?;

            if let Some(window) = app.get_webview_window(WINDOW_LABEL) {
                let icon = Image::from_bytes(include_bytes!("../icons/128x128.png"))?;
                let _ = window.set_icon(icon);
                let _ = window.set_skip_taskbar(true);
                let _ = align_window_to_sidebar(&window);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_main_window,
            align_main_window,
            hide_main_window,
            copy_text_to_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
