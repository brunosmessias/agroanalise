"use client";

import { AlertCircle, Check, Clock, Loader2, RotateCw } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { SyncStatus } from "~/lib/offline/db";

interface SyncBadgeProps {
  status: SyncStatus;
  onRetry?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    classes: string;
    spin?: boolean;
  }
> = {
  pending: {
    label: "Pendente",
    icon: Clock,
    classes:
      "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  },
  syncing: {
    label: "Sincronizando",
    icon: Loader2,
    classes:
      "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    spin: true,
  },
  synced: {
    label: "Sincronizado",
    icon: Check,
    classes:
      "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
  },
  error: {
    label: "Erro",
    icon: AlertCircle,
    classes:
      "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  },
};

export function SyncBadge({ status, onRetry, className }: SyncBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;

  if (status === "synced") return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className={cn("gap-1", config.classes)}>
        <Icon
          className={cn("h-3 w-3", config.spin && "animate-spin")}
        />
        {config.label}
      </Badge>
      {status === "error" && onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 px-2 text-xs text-red-700 hover:text-red-800 dark:text-red-300"
        >
          <RotateCw className="mr-1 h-3 w-3" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
