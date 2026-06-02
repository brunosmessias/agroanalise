import { NextRequest, NextResponse } from "next/server";
import { getPresignedGetUrl } from "~/server/storage/minio";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const objectName = path.join("/");

  try {
    const url = await getPresignedGetUrl(objectName);
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse("Not found", { status: 404 });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal error", { status: 500 });
  }
}
