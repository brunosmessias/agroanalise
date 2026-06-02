import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";
import { updateProfileSchema } from "~/shared/schemas/user";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [found] = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);
    return found ?? null;
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(user)
        .set({
          name: input.name,
          phone: input.phone ?? null,
          company: input.company ?? null,
          bio: input.bio ?? null,
          image: input.image ?? null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.session.user.id))
        .returning();
      return updated;
    }),

  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const [updated] = await ctx.db
      .update(user)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(user.id, ctx.session.user.id))
      .returning();
    return updated;
  }),

  skipOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const [updated] = await ctx.db
      .update(user)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(user.id, ctx.session.user.id))
      .returning();
    return updated;
  }),
});
