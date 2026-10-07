import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { validateImage } from "./image-validation";
describe("actual image verification", () => {
  it("reads real dimensions and strips metadata from a valid upload", async () => {
    const bytes = await sharp({
      create: { width: 32, height: 48, channels: 3, background: "#88aa77" },
    })
      .jpeg()
      .withMetadata()
      .toBuffer();
    const image = await validateImage(bytes);
    expect([image.width, image.height, image.mime]).toEqual([
      32,
      48,
      "image/jpeg",
    ]);
    expect(image.hash).toMatch(/^[a-f0-9]{64}$/);
    expect((await sharp(image.bytes).metadata()).exif).toBeUndefined();
  });
  it("rejects a file with an image extension but non-image bytes", async () => {
    await expect(validateImage(Buffer.from("not an image"))).rejects.toThrow();
  });
  it("rejects empty and oversized uploads before decoding", async () => {
    await expect(validateImage(Buffer.alloc(0))).rejects.toThrow(
      "INVALID_IMAGE_SIZE",
    );
    await expect(
      validateImage(Buffer.alloc(20 * 1024 * 1024 + 1)),
    ).rejects.toThrow("INVALID_IMAGE_SIZE");
  });
});
