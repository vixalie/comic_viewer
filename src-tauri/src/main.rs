// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod protocol;
mod utils;

use commands::AppHold;
use protocol::comic_protocol;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .register_uri_scheme_protocol("comic", comic_protocol)
        .invoke_handler(tauri::generate_handler![
            commands::prelude::scan_directory,
            commands::prelude::show_drives,
            commands::prelude::scan_for_child_dirs,
            commands::prelude::rename_file
        ])
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
