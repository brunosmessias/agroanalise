import { eq, sql, and, gte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { client, analysis } from "~/server/db/schema";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalClients] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(client)
      .where(eq(client.userId, ctx.session.user.id));

    const [totalAnalyses] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(analysis)
      .innerJoin(client, eq(analysis.clientId, client.id))
      .where(eq(client.userId, ctx.session.user.id));

    const [monthAnalyses] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(analysis)
      .innerJoin(client, eq(analysis.clientId, client.id))
      .where(
        and(
          eq(client.userId, ctx.session.user.id),
          gte(analysis.visitDate, startOfMonth),
        ),
      );

    const recentAnalyses = await ctx.db
      .select({
        id: analysis.id,
        title: analysis.title,
        visitDate: analysis.visitDate,
        slug: analysis.slug,
        clientName: client.name,
        clientId: client.id,
      })
      .from(analysis)
      .innerJoin(client, eq(analysis.clientId, client.id))
      .where(eq(client.userId, ctx.session.user.id))
      .orderBy(sql`${analysis.visitDate} desc`)
      .limit(5);

    return {
      totalClients: totalClients?.count ?? 0,
      totalAnalyses: totalAnalyses?.count ?? 0,
      monthAnalyses: monthAnalyses?.count ?? 0,
      recentAnalyses,
    };
  }),
});
