import { NextRequest, NextResponse } from "next/server";
import { getSession } from "~/server/better-auth/server";
import { getMinioClient, MINIO_BUCKET } from "~/server/storage/minio";
import {
  optimizeImage,
  generateThumbnail,
  shouldSkipOptimization,
  getThumbnailObjectName,
} from "~/server/storage/image-processing";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string) || "analysis";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type;
    const userId = session.user.id;

    const folder = purpose === "avatar" ? "avatars" : "photos";
    const uuid = crypto.randomUUID();
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const objectName = `${folder}/${userId}/${uuid}-${baseName}.webp`;
    const thumbObjectName = getThumbnailObjectName(objectName);

    const client = getMinioClient();
    const origin = request.headers.get("origin") || "";
    const baseUrl = `${origin}/api/storage`;

    let optimizedBuffer: Buffer;
    let thumbnailBuffer: Buffer;

    if (shouldSkipOptimization(buffer, contentType)) {
      const originalExt = file.name.split(".").pop() ?? "webp";
      const originalObjectName = `${folder}/${userId}/${uuid}-${baseName}.${originalExt}`;
      await client.putObject(MINIO_BUCKET, originalObjectName, buffer, buffer.length, {
        "Content-Type": contentType,
      });

      return NextResponse.json({
        url: `${baseUrl}/${originalObjectName}`,
        thumbnailUrl: null,
        objectName: originalObjectName,
        skipped: true,
      });
    }

    try {
      const optimized = await optimizeImage(buffer);
      optimizedBuffer = optimized.buffer;
    } catch {
      const originalExt = file.name.split(".").pop() ?? "bin";
      const fallbackObjectName = `${folder}/${userId}/${uuid}-${baseName}.${originalExt}`;
      await client.putObject(MINIO_BUCKET, fallbackObjectName, buffer, buffer.length, {
        "Content-Type": contentType,
      });

      console.warn(
        `[image-optimization] Sharp failed for ${file.name}, saved original as fallback`,
      );

      return NextResponse.json({
        url: `${baseUrl}/${fallbackObjectName}`,
        thumbnailUrl: null,
        objectName: fallbackObjectName,
        fallback: true,
      });
    }

    await client.putObject(MINIO_BUCKET, objectName, optimizedBuffer, optimizedBuffer.length, {
      "Content-Type": "image/webp",
    });

    try {
      const isSquare = purpose === "avatar";
      thumbnailBuffer = await generateThumbnail(buffer, { square: isSquare });

      await client.putObject(
        MINIO_BUCKET,
        thumbObjectName,
        thumbnailBuffer,
        thumbnailBuffer.length,
        { "Content-Type": "image/webp" },
      );
    } catch {
      console.warn(
        `[image-optimization] Thumbnail generation failed for ${file.name}`,
      );
    }

    return NextResponse.json({
      url: `${baseUrl}/${objectName}`,
      thumbnailUrl: `${baseUrl}/${thumbObjectName}`,
      objectName,
    });
  } catch (error) {
    console.error("[image-optimization] Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
