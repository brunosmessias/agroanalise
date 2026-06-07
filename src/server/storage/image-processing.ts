import sharp from "sharp";

const MAX_DIMENSION = 2048;
const THUMB_SIZE = 300;
const OPTIMIZE_QUALITY = 80;
const THUMB_QUALITY = 70;
const SKIP_SIZE_THRESHOLD = 500 * 1024;

export interface OptimizeResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  format: string;
}

export function shouldSkipOptimization(
  buffer: Buffer,
  contentType: string,
): boolean {
  if (contentType === "image/gif") return true;
  if (contentType === "image/webp" && buffer.length < SKIP_SIZE_THRESHOLD)
    return true;
  return false;
}

export async function getImageMetadata(buffer: Buffer) {
  return sharp(buffer).metadata();
}

export async function optimizeImage(
  buffer: Buffer,
): Promise<OptimizeResult> {
  const pipeline = sharp(buffer);
  const metadata = await pipeline.metadata();

  const shouldResize =
    metadata.width && metadata.width > MAX_DIMENSION;

  let processed = pipeline;

  if (shouldResize) {
    processed = processed.resize(MAX_DIMENSION, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  const resultBuffer = await processed
    .webp({ quality: OPTIMIZE_QUALITY })
    .toBuffer();

  const resultMetadata = await sharp(resultBuffer).metadata();

  return {
    buffer: resultBuffer,
    width: resultMetadata.width ?? 0,
    height: resultMetadata.height ?? 0,
    size: resultBuffer.length,
    format: "webp",
  };
}

export async function generateThumbnail(
  buffer: Buffer,
  options?: { square?: boolean },
): Promise<Buffer> {
  const { square = false } = options ?? {};

  const pipeline = sharp(buffer);

  if (square) {
    return pipeline
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer();
  }

  return pipeline
    .resize(THUMB_SIZE, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer();
}

export function getThumbnailObjectName(objectName: string): string {
  const lastDot = objectName.lastIndexOf(".");
  if (lastDot === -1) return `${objectName}_thumb`;
  return `${objectName.slice(0, lastDot)}_thumb${objectName.slice(lastDot)}`;
}
