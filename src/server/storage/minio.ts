import * as Minio from "minio";
import { env } from "~/env";

let _client: Minio.Client | null = null;

export function getMinioClient() {
  _client ??= new Minio.Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  });
  return _client;
}

export const MINIO_BUCKET = env.MINIO_BUCKET;

export async function ensureBucket() {
  const client = getMinioClient();
  const exists = await client.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await client.makeBucket(MINIO_BUCKET);
  }
}

export async function getPresignedUploadUrl(
  objectName: string,
  contentType: string,
  expiresIn: number = 60 * 5,
) {
  const client = getMinioClient();
  return client.presignedPutObject(MINIO_BUCKET, objectName, expiresIn);
}

export async function getPresignedGetUrl(
  objectName: string,
  expiresIn: number = 60 * 60,
) {
  const client = getMinioClient();
  return client.presignedGetObject(MINIO_BUCKET, objectName, expiresIn);
}

export async function deleteObject(objectName: string) {
  const client = getMinioClient();
  await client.removeObject(MINIO_BUCKET, objectName);
}

export function getObjectPublicUrl(objectName: string) {
  const protocol = env.MINIO_USE_SSL ? "https" : "http";
  return `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${MINIO_BUCKET}/${objectName}`;
}
