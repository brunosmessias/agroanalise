"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "~/server/api/root";

let vanillaClient: ReturnType<typeof createTRPCClient<AppRouter>> | null = null;

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getVanillaTrpcClient() {
  if (typeof window === "undefined") return null;
  vanillaClient ??= createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: SuperJSON,
        url: getBaseUrl() + "/api/trpc",
        headers: () => {
          const headers = new Headers();
          headers.set("x-trpc-source", "nextjs-offline-sync");
          return headers;
        },
      }),
    ],
  });
  return vanillaClient;
}
