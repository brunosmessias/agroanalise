"use client";

import { useCallback, useEffect, useState } from "react";
import {
  countByStatus,
  isIndexedDBAvailable,
  type SyncStatus,
} from "~/lib/offline/db";
import {
  getLastSyncAt,
  isQueueProcessing,
  processQueue,
  retryFailed,
} from "~/lib/offline/sync-queue";

export interface SyncStatusState {
  isOnline: boolean;
  isAvailable: boolean;
  pendingCount: number;
  syncingCount: number;
  errorCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  refresh: () => Promise<void>;
  retryFailed: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const EMPTY: Omit<SyncStatusState, "refresh" | "retryFailed" | "syncNow"> = {
  isOnline: true,
  isAvailable: false,
  pendingCount: 0,
  syncingCount: 0,
  errorCount: 0,
  isSyncing: false,
  lastSyncAt: null,
};

async function snapshot(): Promise<Omit<SyncStatusState, "refresh" | "retryFailed" | "syncNow">> {
  if (typeof window === "undefined") {
    return EMPTY;
  }
  const counts = await countByStatus();
  return {
    isOnline: navigator.onLine,
    isAvailable: isIndexedDBAvailable(),
    pendingCount: counts.pending,
    syncingCount: counts.syncing,
    errorCount: counts.error,
    isSyncing: isQueueProcessing(),
    lastSyncAt: getLastSyncAt(),
  };
}

export function useSyncStatus(): SyncStatusState {
  const [state, setState] = useState(EMPTY);

  const refresh = useCallback(async () => {
    setState(await snapshot());
  }, []);

  const syncNow = useCallback(async () => {
    await processQueue();
    await refresh();
  }, [refresh]);

  const retry = useCallback(async () => {
    await retryFailed();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    const handleOnline = () => {
      void refresh();
      void processQueue().then(() => refresh());
    };
    const handleOffline = () => {
      void refresh();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = window.setInterval(() => {
      void refresh();
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
    retryFailed: retry,
    syncNow,
  };
}

export type { SyncStatus };
