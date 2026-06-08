"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { enqueueAnalysis, type PhotoBlob } from "~/lib/offline/sync-queue";

export interface OfflineAnalysisInput {
  clientId: string;
  title: string;
  visitDate: string;
  description: string;
  photos: PhotoBlob[];
}

export type SaveMode = "online" | "offline";

export interface SaveResult {
  mode: SaveMode;
  localId?: number;
  serverId?: string;
}

export interface UseOfflineAnalysis {
  isSaving: boolean;
  saveAnalysis: (input: OfflineAnalysisInput) => Promise<SaveResult>;
}

function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function useOfflineAnalysis(): UseOfflineAnalysis {
  const utils = api.useUtils();
  const createMutation = api.analyses.create.useMutation();
  const createPhotoMutation = api.photos.create.useMutation();
  const [isSaving, setIsSaving] = useState(false);

  const uploadPhoto = useCallback(async (photo: PhotoBlob) => {
    const formData = new FormData();
    const file = new File([photo.blob], photo.fileName, {
      type: photo.mime || "image/jpeg",
    });
    formData.append("file", file);
    formData.append("purpose", "analysis");

    const response = await fetch("/api/upload", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Falha no upload da foto");
    return (await response.json()) as {
      url: string;
      thumbnailUrl: string | null;
    };
  }, []);

  const saveOffline = useCallback(
    async (input: OfflineAnalysisInput): Promise<SaveResult> => {
      const localId = await enqueueAnalysis(input);
      toast.info("Análise salva — será sincronizada quando online", {
        description:
          "Os dados e fotos ficaram salvos no dispositivo e serão enviados automaticamente.",
      });
      return { mode: "offline", localId };
    },
    [],
  );

  const saveOnline = useCallback(
    async (input: OfflineAnalysisInput): Promise<SaveResult> => {
      const created = await createMutation.mutateAsync({
        title: input.title,
        description: input.description || undefined,
        visitDate: input.visitDate,
        clientId: input.clientId,
      });
      if (!created) throw new Error("Falha ao criar análise");

      for (let i = 0; i < input.photos.length; i++) {
        const photo = input.photos[i]!;
        try {
          const upload = await uploadPhoto(photo);
          await createPhotoMutation.mutateAsync({
            imageUrl: upload.url,
            thumbnailUrl: upload.thumbnailUrl,
            description: photo.description ?? "",
            order: i,
            analysisId: created.id,
          });
        } catch (err) {
          console.error("[offline-analysis] photo upload failed", err);
          toast.error(`Erro ao enviar foto ${i + 1}`);
        }
      }

      await Promise.all([
        utils.analyses.list.invalidate({ clientId: input.clientId }),
        utils.clients.getStats.invalidate({ id: input.clientId }),
      ]);

      return { mode: "online", serverId: created.id };
    },
    [createMutation, createPhotoMutation, uploadPhoto, utils],
  );

  const saveAnalysis = useCallback(
    async (input: OfflineAnalysisInput): Promise<SaveResult> => {
      setIsSaving(true);
      try {
        if (!isOnline()) {
          return await saveOffline(input);
        }
        try {
          return await saveOnline(input);
        } catch (err) {
          console.warn("[offline-analysis] online save failed, falling back to queue", err);
          return await saveOffline(input);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [saveOffline, saveOnline],
  );

  return { isSaving, saveAnalysis };
}
