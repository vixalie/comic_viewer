use std::{fs::DirEntry, path::Path};

use mountpoints::mountinfos;
use serde::Serialize;
use tauri::Runtime;

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

fn is_root(entry: &DirEntry) -> bool {
    entry
        .path()
        .to_str()
        .map(|s| s.eq_ignore_ascii_case("/"))
        .unwrap_or(false)
}

#[tauri::command]
pub async fn scan_directory(target: String) -> Result<Vec<FileItem>, String> {
    let mut file_items: Vec<FileItem> = Vec::new();
    for entry in std::fs::read_dir(target).map_err(|e| format!("无法读取指定文件夹，{}", e))?
    {
        let entry = entry.map_err(|e| format!("无法获取指定文件夹信息，{}", e))?;
        if !entry.path().is_file() {
            continue;
        }
        let (width, height) = image::image_dimensions(entry.path())
            .map_err(|_e| format!("读取图片文件 {} 元信息失败。", entry.path().display()))?;
        let file_hash_id = entry
            .path()
            .to_str()
            .map(crate::utils::md5_hash)
            .map(|hash| utils::uuid_from(hash.as_slice()))
            .transpose()?
            .unwrap_or(uuid::Uuid::new_v4().to_string());
        let filename = entry
            .path()
            .file_name()
            .ok_or(String::from("不能获取到文件名。"))?
            .to_owned()
            .into_string()
            .unwrap();
        let path = entry
            .path()
            .clone()
            .to_str()
            .ok_or(String::from("不能获取到文件路径。"))?
            .to_string();
        file_items.push(FileItem {
            id: file_hash_id,
            filename,
            path,
            height,
            width,
        });
    }
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

    let mut child_dirs: Vec<DirItem> = Vec::new();
    for entry in std::fs::read_dir(target).map_err(|e| format!("无法读取指定文件夹，{}", e))?
    {
        let entry = entry.map_err(|e| format!("无法获取指定文件夹信息，{}", e))?;
        if is_hidden(&entry) || is_root(&entry) || entry.path().is_file() {
            continue;
        }
        let dir_hash_id = entry
            .path()
            .to_str()
            .map(crate::utils::md5_hash)
            .map(|hash| utils::uuid_from(hash.as_slice()))
            .transpose()?
            .unwrap_or(uuid::Uuid::new_v4().to_string());
        let dirname = entry
            .path()
            .file_name()
            .ok_or(String::from("不能获取到文件夹的名称。"))?
            .to_owned()
            .into_string()
            .unwrap();
        let path = entry
            .path()
            .clone()
            .to_str()
            .ok_or(String::from("不能获取到文件夹路径。"))?
            .to_string();
        child_dirs.push(DirItem {
            id: dir_hash_id,
            dirname,
            path,
            root: false,
        });
    }
    child_dirs.sort_by(|a, b| a.dirname.partial_cmp(&b.dirname).unwrap());
    Ok(child_dirs)
}
