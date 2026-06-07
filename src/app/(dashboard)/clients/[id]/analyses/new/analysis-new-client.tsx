"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
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
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  ImageIcon,
  Loader2,
  Share2,
  Trash2,
  Maximize2,
  Info,
  Images,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type ClientType = NonNullable<RouterOutputs["clients"]["getById"]>;
type AnalysisType = NonNullable<RouterOutputs["analyses"]["getById"]>;

interface AnalysisNewPageProps {
  client: ClientType;
}

interface PhotoWithPreview {
  id?: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  description: string;
  order: number;
  file?: File;
  isUploading?: boolean;
  isExisting?: boolean;
  uploadError?: boolean;
}

const PHOTO_SAVE_DEBOUNCE_MS = 800;

const STEPS = [
  {
    id: 1,
    title: "Detalhes",
    description: "Informações da análise",
    icon: Info,
  },
  {
    id: 2,
    title: "Fotos",
    description: "Registros fotográficos",
    icon: Images,
  },
  {
    id: 3,
    title: "Concluído",
    description: "Revisar e compartilhar",
    icon: CheckCircle2,
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function AnalysisNewPage({ client }: AnalysisNewPageProps) {
  const utils = api.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [createdAnalysis, setCreatedAnalysis] = useState<AnalysisType | null>(
    null,
  );
  const [photos, setPhotos] = useState<PhotoWithPreview[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());

  const createMutation = api.analyses.create.useMutation({
    onSuccess: async (created) => {
      if (!created) return;
      setCreatedAnalysis(created);
      await Promise.all([
        utils.analyses.list.invalidate({ clientId: client.id }),
        utils.clients.getStats.invalidate({ id: client.id }),
      ]);
      setCurrentStep(2);
    },
    onError: (error) => {
      toast.error(`Erro ao criar análise: ${error.message}`);
    },
  });

  const analysisId = createdAnalysis?.id;

  const { data: existingPhotos, isLoading: photosLoading } =
    api.photos.listByAnalysis.useQuery(
      { analysisId: analysisId ?? "" },
      { enabled: !!analysisId },
    );

  useEffect(() => {
    if (existingPhotos && createdAnalysis) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhotos(
        existingPhotos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          thumbnailUrl: p.thumbnailUrl,
          description: p.description,
          order: p.order,
          isExisting: true,
        })),
      );
    }
  }, [existingPhotos, createdAnalysis]);

  const createPhotoMutation = api.photos.create.useMutation({
    onSuccess: async () => {
      if (!analysisId) return;
      await utils.photos.listByAnalysis.invalidate({ analysisId });
    },
  });
  const deletePhotoMutation = api.photos.delete.useMutation({
    onSuccess: async () => {
      if (!analysisId) return;
      await utils.photos.listByAnalysis.invalidate({ analysisId });
    },
  });
  const updatePhotoMutation = api.photos.update.useMutation();

  const uploadOnePhoto = useCallback(
    async (file: File, photoIndex: number, baseOrder: number) => {
      if (!analysisId) return;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", "analysis");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const uploadData = (await uploadResponse.json()) as {
          url: string;
          thumbnailUrl: string | null;
        };

        const created = await createPhotoMutation.mutateAsync({
          imageUrl: uploadData.url,
          thumbnailUrl: uploadData.thumbnailUrl,
          description: "",
          order: baseOrder + photoIndex + 1,
          analysisId,
        });

        setPhotos((prev) =>
          prev.map((p, idx) =>
            idx === photoIndex
              ? {
                  ...p,
                  id: created?.id,
                  imageUrl: uploadData.url,
                  thumbnailUrl: uploadData.thumbnailUrl,
                  isUploading: false,
                  isExisting: true,
                  file: undefined,
                }
              : p,
          ),
        );
      } catch {
        toast.error(`Erro ao enviar ${file.name}`);
        setPhotos((prev) =>
          prev.map((p, idx) =>
            idx === photoIndex
              ? { ...p, isUploading: false, uploadError: true }
              : p,
          ),
        );
      }
    },
    [analysisId, createPhotoMutation],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const filesArray = Array.from(files);
      const baseOrder = photos.length;

      const newPhotos: PhotoWithPreview[] = filesArray.map((file, i) => ({
        imageUrl: URL.createObjectURL(file),
        description: "",
        order: baseOrder + i + 1,
        file,
        isUploading: true,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);

      await Promise.all(
        filesArray.map((file, i) =>
          uploadOnePhoto(file, baseOrder + i, baseOrder),
        ),
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [photos.length, uploadOnePhoto],
  );

  const handleRemovePhoto = useCallback(
    async (index: number) => {
      const photo = photos[index];
      if (!photo) return;

      if (photo.id && photo.isExisting) {
        try {
          await deletePhotoMutation.mutateAsync({ id: photo.id });
        } catch {
          toast.error("Erro ao remover foto");
          return;
        }
      }

      if (photo.file) {
        URL.revokeObjectURL(photo.imageUrl);
      }

      setPhotos((prev) => prev.filter((_, i) => i !== index));
    },
    [photos, deletePhotoMutation],
  );

  const savePhotoDescription = useCallback(
    async (photoId: string, desc: string) => {
      try {
        await updatePhotoMutation.mutateAsync({ id: photoId, description: desc });
        setPendingSaves((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
      } catch {
        toast.error("Erro ao salvar descrição");
        setPendingSaves((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
      }
    },
    [updatePhotoMutation],
  );

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      const photo = photos[index];
      if (!photo?.id) {
        setPhotos((prev) =>
          prev.map((p, i) => (i === index ? { ...p, description: value } : p)),
        );
        return;
      }

      setPhotos((prev) =>
        prev.map((p, i) => (i === index ? { ...p, description: value } : p)),
      );

      setPendingSaves((prev) => new Set(prev).add(photo.id!));

      const photoId = photo.id;
      window.setTimeout(() => {
        void savePhotoDescription(photoId, value);
      }, PHOTO_SAVE_DEBOUNCE_MS);
    },
    [photos, savePhotoDescription],
  );

  const handleCreate = () => {
    if (title.trim().length < 2) return;
    if (!visitDate) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      visitDate,
      clientId: client.id,
    });
  };

  const shareUrl =
    createdAnalysis && typeof window !== "undefined"
      ? `${window.location.origin}/a/${createdAnalysis.slug}`
      : createdAnalysis
        ? `/a/${createdAnalysis.slug}`
        : "";

  const handleCopyLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const existingCount = useMemo(
    () => photos.filter((p) => p.isExisting && !p.isUploading).length,
    [photos],
  );
  const uploadingCount = useMemo(
    () => photos.filter((p) => p.isUploading).length,
    [photos],
  );

  const openLightbox = (index: number) => {
    if (photos[index]?.isUploading) return;
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () =>
    setLightboxIndex((i) => (i === null || i === 0 ? photos.length - 1 : i - 1));
  const goNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));

  const canCreate =
    title.trim().length >= 2 && !!visitDate && !createMutation.isPending;
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/clients/${client.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Nova análise</h1>
          <p className="text-muted-foreground">
            {client.name} •{" "}
            {new Date(visitDate).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isComplete = currentStepIndex > idx;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => isComplete && setCurrentStep(step.id)}
                disabled={!isComplete}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  isComplete && "cursor-pointer hover:bg-muted/50",
                  !isComplete && !isActive && "cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    (isActive || isComplete) &&
                      "border-primary bg-primary text-primary-foreground",
                    !isActive &&
                      !isComplete &&
                      "border-muted-foreground/30 bg-background text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {idx + 1}. {step.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {step.description}
                  </p>
                </div>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    currentStepIndex > idx
                      ? "bg-primary"
                      : "bg-muted-foreground/20",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da análise</CardTitle>
            <CardDescription>
              Preencha as informações principais para criar a análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Análise de solo - Talhão Norte"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitDate">Data da análise</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysisDesc">Descrição</Label>
              <Textarea
                id="analysisDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Observações gerais..."
              />
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button variant="ghost" asChild>
              <Link href={`/clients/${client.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Link>
            </Button>
            <Button onClick={handleCreate} disabled={!canCreate}>
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {createMutation.isPending ? "Criando..." : "Criar e continuar"}
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && createdAnalysis && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Registros fotográficos</CardTitle>
              <CardDescription>
                {existingCount > 0
                  ? `${existingCount} foto${existingCount > 1 ? "s" : ""} adicionada${existingCount > 1 ? "s" : ""}`
                  : "Adicione as fotos da análise"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Fotos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </CardHeader>
          <CardContent>
            {uploadingCount > 0 && (
              <p className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                {uploadingCount} foto{uploadingCount > 1 ? "s" : ""} enviando...
              </p>
            )}

            {photosLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            )}

            {!photosLoading && photos.length === 0 && (
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 transition-colors hover:border-primary hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="font-medium">Nenhuma foto adicionada</p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Clique aqui ou arraste fotos para enviar
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar fotos
                </Button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, index) => {
                const isPending = photo.id
                  ? pendingSaves.has(photo.id)
                  : false;
                const isSaved = photo.id && !isPending && photo.isExisting;

                return (
                  <div
                    key={photo.id ?? photo.imageUrl}
                    className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
                  >
                    <div className="bg-muted relative aspect-video cursor-pointer overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt={photo.description || `Foto ${index + 1}`}
                        onClick={() => openLightbox(index)}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {photo.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="flex flex-col items-center gap-2 text-white">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Enviando...</span>
                          </div>
                        </div>
                      )}
                      {photo.uploadError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
                          <span className="text-xs font-medium text-white">
                            Falha no upload
                          </span>
                        </div>
                      )}
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(index);
                          }}
                          disabled={photo.isUploading}
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remover foto?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemovePhoto(index)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Foto {index + 1}</span>
                        {isPending && (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            salvando
                          </span>
                        )}
                        {isSaved && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="h-3 w-3" />
                            salvo
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder="Descreva o que esta foto mostra..."
                        value={photo.description}
                        onChange={(e) =>
                          handleDescriptionChange(index, e.target.value)
                        }
                        disabled={photo.isUploading}
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={() => setCurrentStep(3)}>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 3 && createdAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise pronta</CardTitle>
            <CardDescription>
              Revise os dados e compartilhe o relatório com o cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Análise criada e pronta para compartilhar
                </p>
                <p className="text-xs opacity-80">
                  {existingCount} foto{existingCount !== 1 ? "s" : ""}{" "}
                  registrada{existingCount !== 1 ? "s" : ""} •{" "}
                  {new Date(visitDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Título
                </p>
                <p className="mt-1 font-semibold">{title}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Data
                </p>
                <p className="mt-1 font-semibold">
                  {new Date(visitDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Fazenda
                </p>
                <p className="mt-1 font-semibold">{client.name}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Fotos
                </p>
                <p className="mt-1 font-semibold">
                  {existingCount} registro{existingCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {description && (
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Descrição
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Link público
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="bg-background flex-1 truncate rounded border px-2 py-1 text-xs">
                  {shareUrl}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  <Share2 className="mr-2 h-3.5 w-3.5" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button variant="ghost" onClick={() => setCurrentStep(2)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/clients/${client.id}`}>Concluir</Link>
              </Button>
              <Button asChild>
                <Link href={`/a/${createdAnalysis.slug}`} target="_blank">
                  <Share2 className="mr-2 h-4 w-4" />
                  Abrir relatório
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <X className="h-6 w-6" />
          </Button>
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          <div
            className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex]?.imageUrl}
              alt={photos[lightboxIndex]?.description ?? "Foto"}
              className="max-h-[80vh] max-w-[90vw] rounded object-contain"
            />
            {photos[lightboxIndex]?.description && (
              <p className="max-w-2xl rounded bg-black/60 px-4 py-2 text-center text-sm text-white">
                {photos[lightboxIndex]?.description}
              </p>
            )}
            <span className="text-xs text-white/70">
              {lightboxIndex + 1} de {photos.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
