import { eq, desc, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { analysis, analysisPhoto, client } from "~/server/db/schema";
import {
  createAnalysisSchema,
  updateAnalysisSchema,
} from "~/shared/schemas/analysis";

const listInputSchema = z.object({
  clientId: z.string(),
  search: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

const idSchema = z.object({ id: z.string() });
const slugSchema = z.object({ slug: z.string() });

export const analysisRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }) => {
      const { clientId, search, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(analysis)
          .where(eq(analysis.clientId, clientId))
          .orderBy(desc(analysis.visitDate))
          .limit(pageSize)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(analysis)
          .where(eq(analysis.clientId, clientId)),
      ]);

      return {
        data,
        total: countResult[0]?.count ?? 0,
        page,
        pageSize,
      };
    }),

  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const [found] = await ctx.db
        .select()
        .from(analysis)
        .where(eq(analysis.id, input.id))
        .limit(1);
      return found ?? null;
    }),

  getBySlug: publicProcedure
    .input(slugSchema)
    .query(async ({ ctx, input }) => {
      const [found] = await ctx.db
        .select()
        .from(analysis)
        .where(eq(analysis.slug, input.slug))
        .limit(1);

      if (!found) return null;

      const photos = await ctx.db
        .select()
        .from(analysisPhoto)
        .where(eq(analysisPhoto.analysisId, found.id))
        .orderBy(analysisPhoto.order);

      const [clientData] = await ctx.db
        .select()
        .from(client)
        .where(eq(client.id, found.clientId))
        .limit(1);

      const [userData] = await ctx.db.execute<{
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
        image: string | null;
      }>(
        sql`SELECT u.name, u.email, u.phone, u.company, u.image
            FROM ${analysis} a
            INNER JOIN ${client} c ON c.id = a.client_id
            INNER JOIN "user" u ON u.id = c.user_id
            WHERE a.id = ${found.id}
            LIMIT 1`,
      ).then((rows) => Array.from(rows));

      return {
        ...found,
        photos,
        client: clientData
          ? {
              name: clientData.name,
              image: clientData.image,
              email: clientData.email,
              phone: clientData.phone,
              document: clientData.document,
              address: clientData.address,
              city: clientData.city,
              state: clientData.state,
              notes: clientData.notes,
            }
          : null,
        agronomist: userData
          ? {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              company: userData.company,
              image: userData.image,
            }
          : null,
        clientName: clientData?.name ?? "",
        agronomistName: userData?.name ?? "",
      };
    }),

  create: protectedProcedure
    .input(createAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = crypto.randomUUID();
      const [created] = await ctx.db
        .insert(analysis)
        .values({
          title: input.title,
          description: input.description ?? null,
          slug,
          visitDate: new Date(input.visitDate),
          clientId: input.clientId,
        })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(updateAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(analysis)
        .set({
          title: input.title,
          description: input.description ?? null,
          visitDate: new Date(input.visitDate),
          updatedAt: new Date(),
        })
        .where(eq(analysis.id, input.id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(analysis).where(eq(analysis.id, input.id));
      return { success: true };
    }),
});
