"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Edit,
  ExternalLink,
  FileImage,
  FileText,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Trees,
  TrendingUp,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
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
import { ClientFormDialog } from "~/components/clients/client-form-dialog";

type ClientType = NonNullable<RouterOutputs["clients"]["getById"]>;

interface FarmProfilePageProps {
  client: ClientType;
}

export function FarmProfilePage({ client }: FarmProfilePageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const utils = api.useUtils();

  const { data, isLoading } = api.analyses.list.useQuery({
    clientId: client.id,
    page: 1,
    pageSize: 50,
  });

  const { data: stats } = api.clients.getStats.useQuery({ id: client.id });

  const deleteMutation = api.analyses.delete.useMutation({
    onSuccess: async () => {
      toast.success("Análise excluída com sucesso!");
      await Promise.all([
        utils.analyses.list.invalidate({ clientId: client.id }),
        utils.clients.getStats.invalidate({ id: client.id }),
      ]);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir análise: ${error.message}`);
    },
  });

  const initials = client.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const location = [client.city, client.state].filter(Boolean).join(" - ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Perfil da Fazenda
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as informações da fazenda
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button onClick={() => router.push(`/clients/${client.id}/analyses/new`)}>
          <FileText className="mr-2 h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
                <AvatarImage
                  src={client.image ?? undefined}
                  alt={client.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                  {initials || <Trees className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{client.name}</h2>
              {location && (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}
              <Badge variant="secondary" className="mt-3">
                <Trees className="mr-1 h-3 w-3" />
                Fazenda
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4" />
                Contato
              </h3>

              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                >
                  <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Telefone não informado
                </p>
              )}

              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
                >
                  <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Email não informado
                </p>
              )}
            </div>

            {(client.document ?? client.address) && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4" />
                    Documentos & Endereço
                  </h3>
                  {client.document && (
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">
                        CPF / CNPJ
                      </p>
                      <p className="font-medium">{client.document}</p>
                    </div>
                  )}
                  {client.address && (
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">
                        Endereço
                      </p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator className="my-6" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Cadastrada em</span>
                <span>
                  {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Última atualização</span>
                <span>
                  {new Date(client.updatedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Análises
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.totalAnalyses ?? 0}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2">
                    <FileText className="text-primary h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Última análise
                    </p>
                    <p className="text-base font-semibold">
                      {stats?.lastVisit
                        ? new Date(stats.lastVisit).toLocaleDateString("pt-BR")
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Calendar className="text-primary h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Status
                    </p>
                    <p className="text-base font-semibold">
                      {stats && stats.totalAnalyses > 0
                        ? "Ativa"
                        : "Nova"}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2">
                    <TrendingUp className="text-primary h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap text-sm">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Análises</CardTitle>
                <CardDescription>
                  Histórico de análises realizadas
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => router.push(`/clients/${client.id}/analyses/new`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Nova
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              )}

              {data && data.data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileImage className="text-muted-foreground mb-3 h-10 w-10" />
                  <p className="font-medium">Nenhuma análise registrada</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Clique em &quot;Nova&quot; para registrar a primeira análise
                  </p>
                </div>
              )}

              {data && data.data.length > 0 && (
                <div className="space-y-2">
                  {data.data.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <div className="bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                        <FileText className="text-primary h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/clients/${client.id}/analyses/${analysis.id}`}
                          className="hover:underline"
                        >
                          <p className="truncate text-sm font-medium">
                            {analysis.title}
                          </p>
                        </Link>
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(analysis.visitDate).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link href={`/a/${analysis.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir análise?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A análise{" "}
                                <strong>{analysis.title}</strong> e todas as
                                suas fotos serão excluídas permanentemente.
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />
    </div>
  );
}
