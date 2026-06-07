"use client";

import { Share, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

import { useInstallPrompt } from "~/hooks/use-install-prompt";
import { useIsMobile } from "~/hooks/use-mobile";
import { Button } from "~/components/ui/button";

export function InstallBanner() {
  const isMobile = useIsMobile();
  const { canInstall, isInstalled, isIOS, dismissed, promptInstall, dismiss } =
    useInstallPrompt();

  if (!isMobile || isInstalled || dismissed) return null;

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      toast.success("App instalado! Abra pela sua tela inicial.");
    } else if (outcome === "dismissed") {
      dismiss();
    }
  };

  return (
    <div
      role="region"
      aria-label="Instalar AgroAnalise"
      className="relative mb-4 flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex items-start gap-3 sm:flex-1 sm:items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">
            {isIOS ? "Instale o AgroAnalise no iPhone" : "Instale o app AgroAnalise"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isIOS ? (
              <span className="inline-flex flex-wrap items-center gap-1">
                Toque em
                <Share className="inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
                <span className="font-medium">Compartilhar</span>
                e depois
                <span className="font-medium">Adicionar à Tela de Início</span>
              </span>
            ) : (
              "Acesso rápido pela tela inicial, sem barra do navegador."
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        {!isIOS && canInstall && (
          <Button size="sm" onClick={handleInstall} className="h-8 px-3 text-xs">
            Instalar
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={dismiss}
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
