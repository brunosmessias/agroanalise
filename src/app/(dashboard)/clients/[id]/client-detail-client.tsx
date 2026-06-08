"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { SyncBadge } from "~/components/sync/sync-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { ArrowLeft, Plus, Calendar, Trash2, FileImage, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useSyncStatus } from "~/hooks/use-sync-status";
import {
  getAnalysesForClient,
  getPhotosForAnalysis,
  type LocalAnalysis,
} from "~/lib/offline/db";
import { processQueue, retryFailed } from "~/lib/offline/sync-queue";

type ClientType = RouterOutputs["clients"]["getById"];

interface LocalAnalysisWithCount extends LocalAnalysis {
  photoCount: number;
}

interface ClientDetailPageProps {
  client: NonNullable<ClientType>;
}

export function ClientDetailPage({ client }: ClientDetailPageProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const { refresh } = useSyncStatus();
  const [localAnalyses, setLocalAnalyses] = useState<LocalAnalysisWithCount[]>(
    [],
  );

  const { data, isLoading } = api.analyses.list.useQuery({
    clientId: client.id,
    page: 1,
    pageSize: 50,
  });

  const loadLocalAnalyses = useCallback(async () => {
    const items = await getAnalysesForClient(client.id);
    const withCount: LocalAnalysisWithCount[] = await Promise.all(
      items.map(async (a) => {
        const photos = await getPhotosForAnalysis(a.id!);
        return { ...a, photoCount: photos.length };
      }),
    );
    setLocalAnalyses(withCount);
  }, [client.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLocalAnalyses();
    const interval = window.setInterval(() => {
      void loadLocalAnalyses();
    }, 4000);
    const onSyncDone = () => {
      void loadLocalAnalyses();
      void utils.analyses.list.invalidate({ clientId: client.id });
      void refresh();
    };
    window.addEventListener("offline-sync-complete", onSyncDone);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("offline-sync-complete", onSyncDone);
    };
  }, [client.id, refresh, utils, loadLocalAnalyses]);

  const handleRetry = async (_analysisId: number) => {
    await retryFailed();
    await loadLocalAnalyses();
  };

  const handleSyncNow = async () => {
    await processQueue();
    await loadLocalAnalyses();
  };

  const deleteMutation = api.analyses.delete.useMutation({
    onSuccess: async () => {
      toast.success("Análise excluída com sucesso!");
      await utils.analyses.list.invalidate({ clientId: client.id });
    },
    onError: (error) => {
      toast.error(`Erro ao excluir análise: ${error.message}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">
            Criado em{" "}
            {new Date(client.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Button onClick={() => router.push(`/clients/${client.id}/analyses/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.data.length === 0 && localAnalyses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileImage className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Nenhuma análise registrada</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Nova Análise&quot; para registrar a primeira
              análise.
            </p>
          </CardContent>
        </Card>
      )}

      {localAnalyses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Pendentes de sincronização
            </h2>
            <Button variant="ghost" size="sm" onClick={() => void handleSyncNow()}>
              Sincronizar tudo
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localAnalyses.map((analysis) => (
              <Card
                key={`local-${analysis.id}`}
                className="group border-dashed transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {analysis.title}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(analysis.visitDate).toLocaleDateString("pt-BR")}
                    </CardDescription>
                    <div className="mt-2">
                      <SyncBadge
                        status={analysis.status}
                        onRetry={
                          analysis.status === "error"
                            ? () => void handleRetry(analysis.id!)
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                {analysis.description && (
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {analysis.description}
                    </p>
                  </CardContent>
                )}
                <CardContent className="text-muted-foreground flex items-center gap-2 pt-0 text-xs">
                  <ImageIcon className="h-3 w-3" />
                  {analysis.photoCount} foto
                  {analysis.photoCount !== 1 ? "s" : ""} no dispositivo
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="space-y-2">
          {localAnalyses.length > 0 && (
            <h2 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Sincronizadas
            </h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((analysis) => (
              <Card
                key={analysis.id}
                className="group transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <Link
                      href={`/clients/${client.id}/analyses/${analysis.id}`}
                      className="hover:underline"
                    >
                      <CardTitle className="text-base">
                        {analysis.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(analysis.visitDate).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir análise?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A análise{" "}
                          <strong>{analysis.title}</strong> e todas as suas
                          fotos serão excluídas permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteMutation.mutate({ id: analysis.id })
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                {analysis.description && (
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {analysis.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
