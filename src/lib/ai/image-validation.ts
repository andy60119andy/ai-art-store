import sharp from "sharp";
import { createHash } from "node:crypto";
export async function validateImage(bytes: Buffer) {
  if (!bytes.length || bytes.length > 20 * 1024 * 1024)
    throw Error("INVALID_IMAGE_SIZE");
  const image = sharp(bytes, { limitInputPixels: 36_000_000, failOn: "error" });
  const meta = await image.metadata();
  if (
    !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
    !meta.width ||
    !meta.height ||
    (meta.pages ?? 1) > 1
  )
    throw Error("INVALID_IMAGE_FORMAT");
  // Decoding catches truncated/corrupt images; normalization removes metadata.
  const normalized = await image.rotate().toBuffer({ resolveWithObject: true });
  if (normalized.data.length > 20 * 1024 * 1024)
    throw Error("INVALID_IMAGE_SIZE");
  return {
    bytes: normalized.data,
    width: normalized.info.width,
    height: normalized.info.height,
    mime: `image/${meta.format === "jpeg" ? "jpeg" : meta.format}`,
    ext: meta.format === "jpeg" ? "jpg" : meta.format,
    hash: createHash("sha256").update(bytes).digest("hex"),
  };
}
