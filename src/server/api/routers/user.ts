import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        banned: user.banned,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    return users;
  }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const found = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);

    return found[0] ?? null;
  }),
});
