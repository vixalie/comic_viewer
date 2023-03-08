use tauri::{App, AppHandle, Runtime, Window};

mod files;

pub mod prelude {
    pub use super::files::*;
}

/// 用于持有应用实例，可存放不同的应用实例。
pub enum AppHold<'a, R: Runtime> {
    Instance(&'a App<R>),
    Handle(&'a AppHandle<R>),
}

/// 根据提供的应用实例和窗体实例设定窗体的标题。
pub fn update_window_title_with_app<R: Runtime>(
    app: AppHold<R>,
    window: &Window<R>,
    ext: Option<String>,
) -> anyhow::Result<()> {
    let app_name = match app {
        AppHold::Instance(app) => app.package_info().name.clone(),
        AppHold::Handle(app) => app.package_info().name.clone(),
    };
    if let Some(ext) = ext {
        window.set_title(&format!("{} - {}", app_name, ext))?;
    } else {
        window.set_title(&app_name)?;
    }
    Ok(())
}
