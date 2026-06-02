import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.coerce.number().default(9000),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    MINIO_BUCKET: z.string().default("agroanalise"),
    MINIO_USE_SSL: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    OPENAI_API_KEY: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_BUCKET: process.env.MINIO_BUCKET,
    MINIO_USE_SSL: process.env.MINIO_USE_SSL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
