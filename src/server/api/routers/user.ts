import { desc, eq, inArray, sql, and, ne } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { analysis, analysisPhoto, client, user } from "~/server/db/schema";
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
      // Ensure the chosen slug isn't already taken by another agronomist.
      if (input.slug) {
        const [conflict] = await ctx.db
          .select({ id: user.id })
          .from(user)
          .where(and(eq(user.slug, input.slug), ne(user.id, ctx.session.user.id)))
          .limit(1);
        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este endereço já está em uso. Escolha outro.",
          });
        }
      }

      const [updated] = await ctx.db
        .update(user)
        .set({
          name: input.name,
          phone: input.phone ?? null,
          company: input.company ?? null,
          bio: input.bio ?? null,
          slug: input.slug ?? null,
          specialties: input.specialties ?? null,
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

  /**
   * Public-facing "business card" page for an agronomist, reached at
   * /agronomo/{slug}. Returns only safe-to-share fields plus a small portfolio
   * of recent public analyses and headline stats.
   */
  getPublicProfile: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [found] = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
          phone: user.phone,
          company: user.company,
          bio: user.bio,
          specialties: user.specialties,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.slug, input.slug))
        .limit(1);

      if (!found) return null;

      const [clientsCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(client)
        .where(eq(client.userId, found.id));

      const [analysesCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(analysis)
        .innerJoin(client, eq(analysis.clientId, client.id))
        .where(eq(client.userId, found.id));

      const recent = await ctx.db
        .select({
          id: analysis.id,
          title: analysis.title,
          slug: analysis.slug,
          visitDate: analysis.visitDate,
          clientName: client.name,
          city: client.city,
          state: client.state,
        })
        .from(analysis)
        .innerJoin(client, eq(analysis.clientId, client.id))
        .where(eq(client.userId, found.id))
        .orderBy(desc(analysis.visitDate))
        .limit(6);

      const ids = recent.map((a) => a.id);
      const photos = ids.length
        ? await ctx.db
            .select({
              analysisId: analysisPhoto.analysisId,
              imageUrl: analysisPhoto.imageUrl,
              order: analysisPhoto.order,
            })
            .from(analysisPhoto)
            .where(inArray(analysisPhoto.analysisId, ids))
            .orderBy(analysisPhoto.order)
        : [];

      const coverByAnalysis = new Map<string, string>();
      for (const p of photos) {
        if (!coverByAnalysis.has(p.analysisId)) {
          coverByAnalysis.set(p.analysisId, p.imageUrl);
        }
      }

      const portfolio = recent.map((a) => ({
        ...a,
        location: [a.city, a.state].filter(Boolean).join(" - "),
        cover: coverByAnalysis.get(a.id) ?? null,
      }));

      const specialties = (found.specialties ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      return {
        name: found.name,
        image: found.image,
        phone: found.phone,
        company: found.company,
        bio: found.bio,
        specialties,
        memberSince: found.createdAt,
        stats: {
          clients: clientsCount?.count ?? 0,
          analyses: analysesCount?.count ?? 0,
        },
        portfolio,
      };
    }),
});
