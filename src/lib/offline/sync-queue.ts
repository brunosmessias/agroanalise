"use client";

import { toast } from "sonner";
import {
  addPendingAnalysis,
  addPendingPhoto,
  cleanupSynced,
  deletePendingAnalysis,
  getAnalysesForClient,
  getPendingAnalyses,
  getPhotosForAnalysis,
  isIndexedDBAvailable,
  updateAnalysisStatus,
  updatePhotoStatus,
  type LocalAnalysis,
} from "./db";
import { getVanillaTrpcClient } from "./trpc-client";

export interface PhotoBlob {
  blob: Blob;
  mime: string;
  fileName: string;
  description?: string;
}

export interface EnqueueInput {
  clientId: string;
  title: string;
  visitDate: string;
  description: string;
  photos: PhotoBlob[];
}

export interface SyncResult {
  synced: number;
  errors: number;
  total: number;
}

let isProcessing = false;
let lastSyncAt: Date | null = null;

function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

async function uploadOnePhoto(blob: Blob, fileName: string) {
  const formData = new FormData();
  const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
  formData.append("file", file);
  formData.append("purpose", "analysis");

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  return (await response.json()) as {
    url: string;
    thumbnailUrl: string | null;
    objectName: string;
  };
}

export async function enqueueAnalysis(input: EnqueueInput): Promise<number> {
  if (!isIndexedDBAvailable()) {
    throw new Error("Armazenamento local indisponível neste navegador");
  }

  const totalBytes = input.photos.reduce((sum, p) => sum + p.blob.size, 0);
  if (totalBytes > 50 * 1024 * 1024) {
    toast.error("Armazenamento local cheio", {
      description:
        "O total de fotos excede 50 MB. Comprima ou reduza as fotos antes de salvar offline.",
    });
    throw new Error("Local storage quota exceeded");
  }

  const analysisId = await addPendingAnalysis({
    clientId: input.clientId,
    title: input.title,
    visitDate: input.visitDate,
    description: input.description,
  });

  for (let i = 0; i < input.photos.length; i++) {
    const photo = input.photos[i]!;
    await addPendingPhoto({
      pendingAnalysisId: analysisId,
      blob: photo.blob,
      mime: photo.mime,
      fileName: photo.fileName,
      description: photo.description ?? "",
      order: i,
    });
  }

  return analysisId;
}

async function syncOneAnalysis(item: LocalAnalysis): Promise<boolean> {
  const trpc = getVanillaTrpcClient();
  if (!trpc) return false;

  await updateAnalysisStatus(item.id!, "syncing");

  try {
    const created = await trpc.analyses.create.mutate({
      title: item.title,
      description: item.description || undefined,
      visitDate: item.visitDate,
      clientId: item.clientId,
    });

    if (!created) {
      throw new Error("Falha ao criar análise no servidor");
    }

    const photos = await getPhotosForAnalysis(item.id!);

    for (const photo of photos) {
      try {
        await updatePhotoStatus(photo.id!, "syncing");
        const upload = await uploadOnePhoto(photo.blob, photo.fileName);
        await trpc.photos.create.mutate({
          imageUrl: upload.url,
          thumbnailUrl: upload.thumbnailUrl,
          description: photo.description,
          order: photo.order,
          analysisId: created.id,
        });
        await updatePhotoStatus(photo.id!, "synced");
      } catch (err) {
        await updatePhotoStatus(photo.id!, "error");
        console.error("[sync] photo upload failed", err);
      }
    }

    await updateAnalysisStatus(item.id!, "synced", { syncedAt: new Date() });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    await updateAnalysisStatus(item.id!, "error", { error: message });
    return false;
  }
}

export async function processQueue(): Promise<SyncResult> {
  if (isProcessing) {
    return { synced: 0, errors: 0, total: 0 };
  }
  if (!isOnline()) {
    return { synced: 0, errors: 0, total: 0 };
  }

  isProcessing = true;
  try {
    const items = await getPendingAnalyses();
    let synced = 0;
    let errors = 0;
    for (const item of items) {
      const ok = await syncOneAnalysis(item);
      if (ok) synced++;
      else errors++;
    }
    lastSyncAt = new Date();

    if (synced > 0) {
      toast.success(
        `${synced} análise${synced > 1 ? "s" : ""} sincronizada${synced > 1 ? "s" : ""}`,
      );
    }

    if (errors > 0 && synced === 0) {
      toast.error(
        `Não foi possível sincronizar ${errors} análise${errors > 1 ? "s" : ""}`,
      );
    }

    void cleanupSynced(7);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("offline-sync-complete"));
    }

    return { synced, errors, total: items.length };
  } finally {
    isProcessing = false;
  }
}

export async function retryFailed(): Promise<SyncResult> {
  if (!isOnline()) {
    toast.error("Sem conexão — não é possível sincronizar agora");
    return { synced: 0, errors: 0, total: 0 };
  }
  return processQueue();
}

export async function getPendingCount(): Promise<{
  pending: number;
  syncing: number;
  error: number;
  total: number;
}> {
  const items = await getPendingAnalyses();
  const syncing = items.filter((i) => i.status === "syncing").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const error = items.filter((i) => i.status === "error").length;
  return { pending, syncing, error, total: pending + error + syncing };
}

export async function getLocalAnalysesForClient(
  clientId: string,
): Promise<LocalAnalysis[]> {
  return getAnalysesForClient(clientId);
}

export async function removeLocalAnalysis(id: number): Promise<void> {
  await deletePendingAnalysis(id);
}

export function isQueueProcessing(): boolean {
  return isProcessing;
}

export function getLastSyncAt(): Date | null {
  return lastSyncAt;
}
