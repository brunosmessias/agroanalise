"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Users, FileText, CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const { data, isLoading } = api.dashboard.getStats.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {userName}!
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  clientes cadastrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Análises
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalAnalyses}</div>
                <p className="text-xs text-muted-foreground">
                  análises registradas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Análises este Mês
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.monthAnalyses}</div>
                <p className="text-xs text-muted-foreground">
                  análises em{" "}
                  {new Date().toLocaleDateString("pt-BR", { month: "long" })}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análises Recentes</CardTitle>
              <CardDescription>
                Últimas análises registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentAnalyses.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma análise registrada ainda.{" "}
                  <Link href="/clients" className="text-primary underline">
                    Cadastre um cliente
                  </Link>{" "}
                  para começar.
                </p>
              )}
              {data.recentAnalyses.length > 0 && (
                <div className="space-y-3">
                  {data.recentAnalyses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <Link
                          href={`/clients/${item.clientId}/analyses/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.clientName} —{" "}
                          {new Date(item.visitDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/a/${item.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
