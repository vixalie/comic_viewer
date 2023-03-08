// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::AppHold;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            #[cfg(debug_assertions)]
            main_window.open_devtools();
            commands::update_window_title_with_app(AppHold::Instance(app), &main_window, None)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
