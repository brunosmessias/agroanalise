import Dexie, { type Table } from "dexie";

export type SyncStatus = "pending" | "syncing" | "synced" | "error";

export interface LocalAnalysis {
  id?: number;
  clientId: string;
  title: string;
  visitDate: string;
  description: string;
  status: SyncStatus;
  error?: string;
  createdAt: Date;
  syncedAt?: Date;
}

export interface LocalPhoto {
  id?: number;
  pendingAnalysisId: number;
  blob: Blob;
  mime: string;
  fileName: string;
  description: string;
  order: number;
  status: SyncStatus;
}

class AgroAnaliseOfflineDB extends Dexie {
  pendingAnalyses!: Table<LocalAnalysis, number>;
  pendingPhotos!: Table<LocalPhoto, number>;

  constructor() {
    super("AgroAnaliseOffline");
    this.version(1).stores({
      pendingAnalyses:
        "++id, clientId, status, createdAt, syncedAt, [status+clientId]",
      pendingPhotos:
        "++id, pendingAnalysisId, status, order, [pendingAnalysisId+order]",
    });
  }
}

let dbInstance: AgroAnaliseOfflineDB | null = null;

function getDb(): AgroAnaliseOfflineDB | null {
  if (typeof window === "undefined") return null;
  dbInstance ??= new AgroAnaliseOfflineDB();
  return dbInstance;
}

export async function addPendingAnalysis(
  data: Omit<LocalAnalysis, "id" | "status" | "createdAt">,
): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("IndexedDB not available (SSR)");
  return await db.pendingAnalyses.add({
    ...data,
    status: "pending",
    createdAt: new Date(),
  });
}

export async function addPendingPhoto(
  data: Omit<LocalPhoto, "id" | "status">,
): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("IndexedDB not available (SSR)");
  return await db.pendingPhotos.add({ ...data, status: "pending" });
}

export async function getPendingAnalyses(): Promise<LocalAnalysis[]> {
  const db = getDb();
  if (!db) return [];
  return await db.pendingAnalyses
    .where("status")
    .anyOf("pending", "error")
    .toArray();
}

export async function getAnalysesForClient(
  clientId: string,
): Promise<LocalAnalysis[]> {
  const db = getDb();
  if (!db) return [];
  return await db.pendingAnalyses
    .where("clientId")
    .equals(clientId)
    .reverse()
    .sortBy("createdAt");
}

export async function getPhotosForAnalysis(
  pendingAnalysisId: number,
): Promise<LocalPhoto[]> {
  const db = getDb();
  if (!db) return [];
  return await db.pendingPhotos
    .where("pendingAnalysisId")
    .equals(pendingAnalysisId)
    .sortBy("order");
}

export async function updateAnalysisStatus(
  id: number,
  status: SyncStatus,
  extra?: Partial<Pick<LocalAnalysis, "error" | "syncedAt">>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.pendingAnalyses.update(id, { status, ...extra });
}

export async function updatePhotoStatus(
  id: number,
  status: SyncStatus,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.pendingPhotos.update(id, { status });
}

export async function deletePendingAnalysis(id: number): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.transaction("rw", db.pendingAnalyses, db.pendingPhotos, async () => {
    await db.pendingPhotos
      .where("pendingAnalysisId")
      .equals(id)
      .delete();
    await db.pendingAnalyses.delete(id);
  });
}

export async function countByStatus(): Promise<
  Record<SyncStatus, number>
> {
  const db = getDb();
  const result: Record<SyncStatus, number> = {
    pending: 0,
    syncing: 0,
    synced: 0,
    error: 0,
  };
  if (!db) return result;
  const counts = await db.pendingAnalyses
    .where("status")
    .anyOf("pending", "syncing", "synced", "error")
    .count();
  void counts;
  const rows = await db.pendingAnalyses.toArray();
  for (const row of rows) {
    result[row.status] = (result[row.status] ?? 0) + 1;
  }
  return result;
}

export async function cleanupSynced(olderThanDays = 7): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const old = await db.pendingAnalyses
    .where("status")
    .equals("synced")
    .and((a) => !!a.syncedAt && a.syncedAt < cutoff)
    .toArray();
  if (old.length === 0) return 0;
  const ids = old.map((a) => a.id!).filter((id) => typeof id === "number");
  await db.transaction("rw", db.pendingAnalyses, db.pendingPhotos, async () => {
    await db.pendingPhotos
      .where("pendingAnalysisId")
      .anyOf(ids)
      .delete();
    await db.pendingAnalyses.where("id").anyOf(ids).delete();
  });
  return old.length;
}

export function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}
