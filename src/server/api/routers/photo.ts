import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { analysisPhoto } from "~/server/db/schema";
import { getPresignedUploadUrl, deleteObject } from "~/server/storage/minio";

const analysisIdSchema = z.object({ analysisId: z.string() });
const idSchema = z.object({ id: z.string() });

const uploadUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  purpose: z.enum(["analysis", "avatar"]).default("analysis"),
});

const createPhotoSchema = z.object({
  imageUrl: z.string(),
  description: z.string(),
  order: z.number(),
  analysisId: z.string(),
});

const updatePhotoSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export const photoRouter = createTRPCRouter({
  listByAnalysis: protectedProcedure
    .input(analysisIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(analysisPhoto)
        .where(eq(analysisPhoto.analysisId, input.analysisId))
        .orderBy(analysisPhoto.order);
    }),

  getUploadUrl: protectedProcedure
    .input(uploadUrlSchema)
    .mutation(async ({ ctx, input }) => {
      const folder = input.purpose === "avatar" ? "avatars" : "photos";
      const objectName = `${folder}/${ctx.session.user.id}/${crypto.randomUUID()}-${input.fileName}`;
      const uploadUrl = await getPresignedUploadUrl(objectName, input.contentType);
      return { uploadUrl, objectName };
    }),

  create: protectedProcedure
    .input(createPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(analysisPhoto)
        .values({
          imageUrl: input.imageUrl,
          description: input.description,
          order: input.order,
          analysisId: input.analysisId,
        })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(updatePhotoSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(analysisPhoto)
        .set({ description: input.description, updatedAt: new Date() })
        .where(eq(analysisPhoto.id, input.id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const [photo] = await ctx.db
        .select()
        .from(analysisPhoto)
        .where(eq(analysisPhoto.id, input.id))
        .limit(1);

      if (photo) {
        try {
          const objectName = photo.imageUrl.split("/").slice(-2).join("/");
          await deleteObject(objectName);
        } catch {
          // Log error but still delete from DB
        }
      }

      await ctx.db.delete(analysisPhoto).where(eq(analysisPhoto.id, input.id));
      return { success: true };
    }),
});
