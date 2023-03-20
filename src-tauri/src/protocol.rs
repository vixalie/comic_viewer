use std::{error::Error, fs, path::Path};

use tauri::{
    http::{Request, Response, ResponseBuilder},
    AppHandle, Runtime,
};
use urlencoding::decode;

pub fn comic_protocol<R: Runtime>(
    _app_handler: &AppHandle<R>,
    request: &Request,
) -> Result<Response, Box<dyn Error>> {
    let response_builder = ResponseBuilder::new();
    let path = request
        .uri()
        .strip_prefix("comic://localhost/")
        .map(|u| decode(u).unwrap())
        .unwrap();
    println!("[debug]request: {}", path);
    if path.len() == 0 {
        return response_builder
            .mimetype("text/plain")
            .status(404)
            .body(Vec::new());
    }

    let path = Path::new(path.as_ref());
    if !path.exists() {
        return response_builder
            .mimetype("text/plain")
            .status(404)
            .body(Vec::new());
    }

    let mimetype = mime_guess::from_path(path);
    let content = fs::read(path)?;

    response_builder
        .mimetype(mimetype.first_or_text_plain().essence_str())
        .status(200)
        .body(content)
}
