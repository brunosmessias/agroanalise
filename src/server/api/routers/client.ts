import { eq, ilike, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { analysis, client } from "~/server/db/schema";
import {
  createClientSchema,
  updateClientSchema,
} from "~/shared/schemas/client";

const listInputSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

const idSchema = z.object({ id: z.string() });

export const clientRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = search
        ? ilike(client.name, `%${search}%`)
        : undefined;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select({
            id: client.id,
            name: client.name,
            document: client.document,
            email: client.email,
            phone: client.phone,
            address: client.address,
            city: client.city,
            state: client.state,
            notes: client.notes,
            image: client.image,
            userId: client.userId,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            totalAnalyses: sql<number>`(
              SELECT COUNT(*)::int FROM ${analysis} a WHERE a.client_id = ${client.id}
            )`,
            lastVisit: sql<Date | null>`(
              SELECT MAX(visit_date) FROM ${analysis} a WHERE a.client_id = ${client.id}
            )`,
          })
          .from(client)
          .where(conditions)
          .orderBy(desc(client.createdAt))
          .limit(pageSize)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(client)
          .where(conditions),
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
        .from(client)
        .where(eq(client.id, input.id))
        .limit(1);
      return found ?? null;
    }),

  getStats: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const [photoCount] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(client);
      const visits = await ctx.db.execute<{ count: number }>(
        sql`SELECT COUNT(*)::int AS count FROM analysis WHERE client_id = ${input.id}`,
      );
      const lastVisit = await ctx.db.execute<{ visit_date: Date | null }>(
        sql`SELECT MAX(visit_date) AS visit_date FROM analysis WHERE client_id = ${input.id}`,
      );
      return {
        totalPhotos: photoCount?.count ?? 0,
        totalAnalyses: Number(visits?.[0]?.count ?? 0),
        lastVisit: lastVisit?.[0]?.visit_date ?? null,
      };
    }),

  create: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(client)
        .values({
          name: input.name,
          document: input.document ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
          city: input.city ?? null,
          state: input.state ?? null,
          notes: input.notes ?? null,
          image: input.image ?? null,
          userId: ctx.session.user.id,
        })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(updateClientSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(client)
        .set({
          name: data.name,
          document: data.document ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          address: data.address ?? null,
          city: data.city ?? null,
          state: data.state ?? null,
          notes: data.notes ?? null,
          image: data.image ?? null,
          updatedAt: new Date(),
        })
        .where(eq(client.id, id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(client).where(eq(client.id, input.id));
      return { success: true };
    }),
});
