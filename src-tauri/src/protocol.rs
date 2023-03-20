use std::{error::Error, io::Cursor, path::Path};

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

    let content = image::io::Reader::open(path)?.decode()?;
    let mut bytes: Vec<u8> = Vec::new();
    content.write_to(&mut Cursor::new(&mut bytes), image::ImageOutputFormat::Png)?;

    response_builder
        .mimetype("image/png")
        .status(200)
        .body(bytes)
}
