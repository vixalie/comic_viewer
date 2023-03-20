use std::path::Path;

use anyhow::anyhow;
use mountpoints::mountinfos;
use serde::Serialize;
use tauri::Runtime;
use walkdir::{DirEntry, WalkDir};

use crate::utils;

#[derive(Debug, Clone, Serialize)]
pub struct FileItem {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub height: u32,
    pub width: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct DirItem {
    pub id: String,
    pub dirname: String,
    pub path: String,
    pub root: bool,
}

fn is_hidden(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s.starts_with(".") || s.starts_with("$"))
        .unwrap_or(false)
}

fn is_self<P: AsRef<Path>>(entry: &DirEntry, target: P) -> bool {
    entry.path().eq(target.as_ref())
}

fn is_root(entry: &DirEntry) -> bool {
    entry
        .path()
        .to_str()
        .map(|s| s.eq_ignore_ascii_case("/"))
        .unwrap_or(false)
}

#[tauri::command]
pub async fn scan_directory(target: String) -> Result<Vec<FileItem>, String> {
    let mut file_items = WalkDir::new(target)
        .max_depth(1)
        .into_iter()
        .filter_entry(|entry| !is_hidden(entry))
        .filter_map(|f| f.ok())
        .filter(|f| f.path().is_file())
        .map(|f| {
            let (width, height) = image::image_dimensions(f.path())?;
            let file_hash_id = f
                .path()
                .to_str()
                .map(crate::utils::md5_hash)
                .map(|hash| utils::uuid_from(hash.as_slice()))
                .transpose()
                .map_err(|e| anyhow!(e))?
                .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
            Ok(FileItem {
                id: file_hash_id,
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

#[tauri::command]
pub async fn show_drives<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
) -> Result<Vec<DirItem>, String> {
    let mut drives = vec![];
    match mountinfos() {
        Ok(mounts) => {
            #[cfg(any(target_os = "macos", target_os = "linux"))]
            let mounts = mounts
                .iter()
                .filter(|m| !m.path.starts_with("/System") && !m.path.starts_with("/dev"));
            for mount in mounts {
                let dirname = mount
                    .path
                    .as_path()
                    .file_name()
                    .unwrap_or_default()
                    .to_os_string()
                    .into_string()
                    .unwrap();
                let dirname = if dirname.len() == 0 {
                    String::from("/")
                } else {
                    dirname
                };
                let dir_hash_id = mount
                    .path
                    .to_str()
                    .map(crate::utils::md5_hash)
                    .map(|hash| utils::uuid_from(hash.as_slice()))
                    .transpose()?
                    .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
                drives.push(DirItem {
                    id: dir_hash_id,
                    dirname,
                    path: String::from(mount.path.to_str().unwrap_or_default()),
                    root: true,
                })
            }
        }
        Err(err) => return Err(format!("不能列出系统中已挂载的磁盘：{}", err)),
    }
    Ok(drives)
}

#[tauri::command]
pub async fn scan_for_child_dirs<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    target: String,
) -> Result<Vec<DirItem>, String> {
    println!("请求扫描文件夹：{}", target);
    let target = if target.eq_ignore_ascii_case("/") {
        Path::new(r"/")
    } else {
        Path::new(&target)
    };
    let mut child_dirs = WalkDir::new(target)
        .max_depth(1)
        .into_iter()
        .filter_entry(|entry| !is_hidden(entry) && !is_root(entry))
        .filter_map(|d| d.ok())
        .filter(|d| d.path().is_dir() && !is_self(d, target))
        .map(|d| {
            println!("扫描到的文件夹：{}", d.path().display());
            let dir_hash_id = d
                .path()
                .to_str()
                .map(crate::utils::md5_hash)
                .map(|hash| utils::uuid_from(hash.as_slice()))
                .transpose()
                .map_err(|e| anyhow!(e))?
                .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
            Ok(DirItem {
                id: dir_hash_id,
                dirname: d
                    .path()
                    .file_name()
                    .ok_or(anyhow!("不能获取到文件夹的名称。"))?
                    .to_owned()
                    .into_string()
                    .unwrap(),
                path: d
                    .path()
                    .clone()
                    .to_str()
                    .ok_or(anyhow!("不能获取到文件夹路径。"))?
                    .to_string(),
                root: false,
            })
        })
        .collect::<Result<Vec<DirItem>, anyhow::Error>>()
        .map_err(|e| e.to_string())?;
    child_dirs.sort_by(|a, b| a.dirname.partial_cmp(&b.dirname).unwrap());
    Ok(child_dirs)
}
