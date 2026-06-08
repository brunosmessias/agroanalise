"use client";

import { CloudOff, Loader2, RefreshCw, Wifi } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSyncStatus } from "~/hooks/use-sync-status";

export function SyncBanner() {
  const { pendingCount, errorCount, isOnline, isSyncing, syncNow } =
    useSyncStatus();

  if (!isOnline) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
        <div className="flex items-center gap-2">
          <CloudOff className="h-4 w-4 shrink-0" />
          <p>
            <strong>Você está offline.</strong> As análises criadas serão salvas
            no dispositivo e sincronizadas quando a conexão voltar.
          </p>
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        <p>Sincronizando análises pendentes...</p>
      </div>
    );
  }

  const total = pendingCount + errorCount;
  if (total === 0) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 shrink-0" />
        <p>
          <strong>
            {total} análise{total > 1 ? "s" : ""} pendente
            {total > 1 ? "s" : ""} de sincronização
          </strong>
          {errorCount > 0 && (
            <span className="ml-1 text-red-700 dark:text-red-300">
              ({errorCount} com erro)
            </span>
          )}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void syncNow()}
        className="h-8 border-yellow-500/40 bg-background/50 hover:bg-background"
      >
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Sincronizar agora
      </Button>
    </div>
  );
}
