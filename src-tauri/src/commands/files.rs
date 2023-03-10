use anyhow::anyhow;
use serde::Serialize;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize)]
pub struct FileItem {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub height: u32,
    pub width: u32,
}

#[tauri::command]
pub fn scan_directory(target: String) -> Result<Vec<FileItem>, String> {
    let mut file_items = WalkDir::new(target)
        .into_iter()
        .filter_map(|f| f.ok())
        .filter(|f| f.path().is_file())
        .map(|f| {
            let (width, height) = image::image_dimensions(f.path())?;
            Ok(FileItem {
                id: uuid::Uuid::new_v4().to_string(),
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
                width,
                height,
            })
        })
        .collect::<Result<Vec<FileItem>, anyhow::Error>>()
        .map_err(|e| e.to_string())?;
    file_items.sort_by(|a, b| a.filename.partial_cmp(&b.filename).unwrap());

    Ok(file_items)
}
