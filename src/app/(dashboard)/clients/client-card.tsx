"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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

type ClientItem = RouterOutputs["clients"]["list"]["data"][number];

interface ClientCardProps {
  client: ClientItem;
}

export function ClientCard({ client }: ClientCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const utils = api.useUtils();

  const deleteMutation = api.clients.delete.useMutation({
    onSuccess: async () => {
      toast.success("Fazenda excluída com sucesso!");
      await utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
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
  const hasAnalyses = client.totalAnalyses > 0;
  const lastVisit = client.lastVisit
    ? new Date(client.lastVisit).toLocaleDateString("pt-BR")
    : null;

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="from-primary/10 via-primary/5 to-background relative h-20 bg-gradient-to-br">
          <div className="absolute -bottom-8 left-4">
            <Avatar className="border-background h-16 w-16 border-4 shadow-md">
              <AvatarImage
                src={client.image ?? undefined}
                alt={client.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials || "??"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/60 hover:bg-background/90 h-8 w-8 shrink-0 backdrop-blur"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/clients/${client.id}/profile`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/clients/${client.id}/analyses/new`)
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Análise
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir fazenda?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todas as análises
                        associadas a <strong>{client.name}</strong> também
                        serão excluídas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate({ id: client.id })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardHeader className="pt-10">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/clients/${client.id}/profile`}
              className="hover:underline"
            >
              <CardTitle className="line-clamp-1 text-base">
                {client.name}
              </CardTitle>
            </Link>
            <Badge
              variant={hasAnalyses ? "default" : "secondary"}
              className="shrink-0"
            >
              <ClipboardList className="mr-1 h-3 w-3" />
              {client.totalAnalyses}{" "}
              {client.totalAnalyses === 1 ? "análise" : "análises"}
            </Badge>
          </div>
          {location && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            {lastVisit ? (
              <span>
                Última análise:{" "}
                <span className="text-foreground font-medium">
                  {lastVisit}
                </span>
              </span>
            ) : (
              <span className="italic">Nenhuma análise registrada</span>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            {client.phone ? (
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <span className="truncate">{client.phone}</span>
              </p>
            ) : null}
            {client.email ? (
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <span className="truncate">{client.email}</span>
              </p>
            ) : null}
            {!client.phone && !client.email && (
              <p className="text-muted-foreground/60 italic">
                Sem informações de contato
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() =>
                router.push(`/clients/${client.id}/analyses/new`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Análise
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/clients/${client.id}/profile`)}
            >
              Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />
    </>
  );
}
