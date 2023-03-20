use md5::{Digest, Md5};
use uuid::Builder;

pub fn md5_hash(source: &str) -> Vec<u8> {
    let mut hasher = Md5::new();
    hasher.update(source);
    let hash = hasher.finalize();
    hash.to_vec()
}

pub fn uuid_from(source: &[u8]) -> Result<String, String> {
    let builder = Builder::from_md5_bytes(
        source
            .try_into()
            .map_err(|_| String::from("源内容长度不足。"))?,
    );

    Ok(builder.into_uuid().to_string())
}
