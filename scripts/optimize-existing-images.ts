import "dotenv/config";
import { db } from "../src/server/db/index";
import { analysisPhoto } from "../src/server/db/schema";
import { isNull, sql } from "drizzle-orm";
import { getMinioClient, MINIO_BUCKET } from "../src/server/storage/minio";
import {
  optimizeImage,
  generateThumbnail,
  shouldSkipOptimization,
  getThumbnailObjectName,
} from "../src/server/storage/image-processing";

async function main() {
  console.log("=== Image Optimization Migration ===\n");

  const photos = await db
    .select()
    .from(analysisPhoto)
    .where(isNull(analysisPhoto.thumbnailUrl));

  console.log(`Found ${photos.length} photos to process\n`);

  if (photos.length === 0) {
    console.log("No photos to process. Done!");
    return;
  }

  const client = getMinioClient();
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let totalSavedBytes = 0;

  for (const photo of photos) {
    const objectName = extractObjectName(photo.imageUrl);
    if (!objectName) {
      console.warn(`  [SKIP] Could not extract object name from: ${photo.imageUrl}`);
      skipped++;
      continue;
    }

    try {
      console.log(`  Processing: ${objectName}`);

      const objectStream = await client.getObject(MINIO_BUCKET, objectName);
      const chunks: Buffer<ArrayBufferLike>[] = [];
      for await (const chunk of objectStream) {
        chunks.push(Buffer.from(chunk as ArrayBuffer));
      }
      const originalBuffer = Buffer.concat(chunks);
      const originalSize = originalBuffer.length;

      const contentType = guessContentType(objectName);

      if (shouldSkipOptimization(originalBuffer, contentType)) {
        console.log(`    Skipped (already optimized or GIF)`);
        skipped++;

        const thumbBuffer = await generateThumbnail(originalBuffer);
        const thumbObjectName = getThumbnailObjectName(
          objectName.replace(/\.[^.]+$/, ".webp"),
        );
        await client.putObject(
          MINIO_BUCKET,
          thumbObjectName,
          thumbBuffer,
          thumbBuffer.length,
          { "Content-Type": "image/webp" },
        );

        const baseUrl = photo.imageUrl.split("/api/storage/")[0];
        const thumbnailUrl = `${baseUrl}/api/storage/${thumbObjectName}`;
        await db
          .update(analysisPhoto)
          .set({ thumbnailUrl })
          .where(sql`${analysisPhoto.id} = ${photo.id}`);

        processed++;
        continue;
      }

      const optimized = await optimizeImage(originalBuffer);
      const savedBytes = originalSize - optimized.size;
      totalSavedBytes += Math.max(0, savedBytes);

      const webpObjectName = objectName.replace(/\.[^.]+$/, ".webp");
      await client.putObject(
        MINIO_BUCKET,
        webpObjectName,
        optimized.buffer,
        optimized.buffer.length,
        { "Content-Type": "image/webp" },
      );

      const thumbBuffer = await generateThumbnail(originalBuffer);
      const thumbObjectName = getThumbnailObjectName(webpObjectName);
      await client.putObject(
        MINIO_BUCKET,
        thumbObjectName,
        thumbBuffer,
        thumbBuffer.length,
        { "Content-Type": "image/webp" },
      );

      const baseUrl = photo.imageUrl.split("/api/storage/")[0];
      const newImageUrl = `${baseUrl}/api/storage/${webpObjectName}`;
      const thumbnailUrl = `${baseUrl}/api/storage/${thumbObjectName}`;

      await db
        .update(analysisPhoto)
        .set({ imageUrl: newImageUrl, thumbnailUrl })
        .where(sql`${analysisPhoto.id} = ${photo.id}`);

      if (webpObjectName !== objectName) {
        try {
          await client.removeObject(MINIO_BUCKET, objectName);
        } catch {
          // Old object deletion is best-effort
        }
      }

      processed++;
      console.log(
        `    Done: ${formatBytes(originalSize)} → ${formatBytes(optimized.size)} (saved ${formatBytes(savedBytes)})`,
      );
    } catch (err) {
      console.error(`    [ERROR] Failed to process ${objectName}:`, err);
      errors++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total:   ${photos.length}`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Errors:    ${errors}`);
  console.log(`Storage saved: ${formatBytes(totalSavedBytes)}`);
  console.log("\nDone!");
}

function extractObjectName(url: string): string | null {
  const parts = url.split("/api/storage/");
  return parts.length > 1 ? parts[1]! : null;
}

function guessContentType(objectName: string): string {
  const ext = objectName.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function formatBytes(bytes: number): string {
  if (bytes < 0) return `-${formatBytes(-bytes)}`;
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

main().catch(console.error);
