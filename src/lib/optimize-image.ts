import sharp from "sharp";

export const WEB_IMAGE_MAX_PX = 1600;
export const WEB_IMAGE_QUALITY = 85;

/**
 * Resize to fit inside 1600×1600 without enlarging, apply EXIF orientation,
 * then strip EXIF/GPS by omitting withMetadata.
 */
export async function optimizeImageForWeb(input: Buffer): Promise<{ bytes: Buffer; ext: "jpg" }> {
  const bytes = await sharp(input)
    .rotate()
    .resize({
      width: WEB_IMAGE_MAX_PX,
      height: WEB_IMAGE_MAX_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: WEB_IMAGE_QUALITY, mozjpeg: true })
    .toBuffer();
  return { bytes, ext: "jpg" };
}
