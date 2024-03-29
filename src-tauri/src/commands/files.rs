use std::{
    fs::{self, DirEntry},
    path::{Path, PathBuf},
};

use mountpoints::mountinfos;
use regex::Regex;
use serde::Serialize;
use tauri::Runtime;

use crate::utils;

fn compute_all_digits(text: &str) -> usize {
    let re = Regex::new(r#"\d+"#).unwrap();
    re.find_iter(&["a", text, "0"].join(" "))
        .map(|b| b.as_str())
        .map(|b| usize::from_str_radix(b, 10).unwrap_or(0))
        .sum::<usize>()
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FileItem {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub height: u32,
    pub width: u32,
}

impl PartialOrd for FileItem {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        let this_digit = compute_all_digits(&self.filename);
        let other_digit = compute_all_digits(&other.filename);
        if this_digit == other_digit {
            self.filename.partial_cmp(&other.filename)
        } else {
            this_digit.partial_cmp(&other_digit)
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct DirItem {
    pub id: String,
    pub dirname: String,
    pub path: String,
    pub root: bool,
}

impl PartialOrd for DirItem {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        let this_digit = compute_all_digits(&self.dirname);
        let other_digit = compute_all_digits(&other.dirname);
        if this_digit == other_digit {
            self.dirname.partial_cmp(&other.dirname)
        } else {
            this_digit.partial_cmp(&other_digit)
        }
    }
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
        let image_detect_result = image::image_dimensions(entry.path());
        if image_detect_result.is_err() {
            println!("读取图片文件 {} 元信息失败。", entry.path().display());
            continue;
        }
        let (width, height) = image_detect_result.unwrap();
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
            .ok_or(String::from("不能获取到文件名。"))
            .map(ToOwned::to_owned)
            .map(|s| s.into_string().unwrap());
        if filename.is_err() {
            println!("不能获取到文件 {} 文件名。", entry.path().display());
            continue;
        }
        let path = entry
            .path()
            .clone()
            .to_str()
            .ok_or(String::from("不能获取到文件路径。"))
            .map(ToString::to_string);
        if path.is_err() {
            println!("不能获取到文件 {} 路径。", entry.path().display());
            continue;
        }
        file_items.push(FileItem {
            id: file_hash_id,
            filename: filename.unwrap(),
            path: path.unwrap(),
            height,
            width,
        });
    }
    file_items.sort_by(|a, b| a.partial_cmp(&b).unwrap());

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
                #[cfg(any(target_os = "macos", target_os = "linux"))]
                let dirname = mount
                    .path
                    .as_path()
                    .file_name()
                    .unwrap_or_default()
                    .to_os_string()
                    .into_string()
                    .unwrap();
                #[cfg(target_os = "windows")]
                let dirname = mount.path.display().to_string();
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
    child_dirs.sort_by(|a, b| a.partial_cmp(&b).unwrap());
    Ok(child_dirs)
}

#[tauri::command]
pub async fn rename_file<R: Runtime>(
    _app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    store_path: String,
    origin_name: String,
    new_name: String,
) -> Result<(), String> {
    let origin_file = PathBuf::from(store_path.clone()).join(origin_name);
    let new_file = PathBuf::from(store_path).join(new_name);
    fs::rename(origin_file, new_file).map_err(|e| format!("重命名问文件失败，{}", e))?;
    Ok(())
}
