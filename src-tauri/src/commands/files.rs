use anyhow::anyhow;
use serde::Serialize;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize)]
pub struct FileItem {
    pub filename: String,
    pub path: String,
}

#[tauri::command]
pub fn scan_directory(target: String) -> Result<Vec<FileItem>, String> {
    WalkDir::new(target)
        .into_iter()
        .filter_map(|f| f.ok())
        .filter(|f| f.path().is_file())
        .map(|f| {
            Ok(FileItem {
                filename: f
                    .path()
                    .file_name()
                    .ok_or(anyhow!("不能获取到文件名。"))?
                    .to_owned()
                    .into_string()
                    .unwrap(),
                path: f
                    .path()
                    .clone()
                    .to_str()
                    .ok_or(anyhow!("不能获取到文件路径。"))?
                    .to_string(),
            })
        })
        .collect::<Result<Vec<FileItem>, anyhow::Error>>()
        .map_err(|e| e.to_string())
}
