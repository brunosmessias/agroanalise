import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { clientRouter } from "~/server/api/routers/client";
import { analysisRouter } from "~/server/api/routers/analysis";
import { photoRouter } from "~/server/api/routers/photo";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { userRouter } from "~/server/api/routers/user";

export const appRouter = createTRPCRouter({
  clients: clientRouter,
  analyses: analysisRouter,
  photos: photoRouter,
  dashboard: dashboardRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
