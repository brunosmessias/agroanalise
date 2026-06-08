"use client";

import { useEffect } from "react";
import { useSyncStatus } from "~/hooks/use-sync-status";
import { processQueue } from "~/lib/offline/sync-queue";

interface SyncProviderProps {
  children: React.ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { isOnline, refresh } = useSyncStatus();

  useEffect(() => {
    if (!isOnline) return;
    void processQueue().then(() => refresh());
  }, [isOnline, refresh]);

  return <>{children}</>;
}
