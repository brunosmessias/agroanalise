"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Plus, Search, Users } from "lucide-react";
import { CreateClientDialog } from "./create-client-dialog";
import { ClientCard } from "./client-card";

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

  const search = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`/clients?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading, isError } = api.clients.list.useQuery({
    search: search || undefined,
    page,
    pageSize: 12,
  });

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("q") ?? "";
      if (searchInput !== currentSearch) {
        updateParams({ q: searchInput || null, page: null });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, searchParams, updateParams]);

  const firstClientId = data?.data[0]?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fazendas</h1>
          <p className="text-muted-foreground">
            Gerencie suas fazendas e análises
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              firstClientId &&
              router.push(`/clients/${firstClientId}/analyses/new`)
            }
            disabled={!firstClientId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Análise
          </Button>
          <Button onClick={() => setClientDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Fazenda
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar fazendas..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Erro ao carregar clientes. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      {data && data.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Nenhuma fazenda encontrada</p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Tente alterar os termos da busca"
                : "Clique em 'Nova Fazenda' para começar"}
            </p>
          </CardContent>
        </Card>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((c) => (
              <ClientCard key={c.id} client={c} />
            ))}
          </div>

          {data.total > 12 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {Math.ceil(data.total / 12)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / 12)}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <CreateClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
      />
    </div>
  );
}
