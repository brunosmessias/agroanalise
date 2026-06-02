import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { ClientDetailPage } from "./client-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const client = await api.clients.getById({ id });

  if (!client) {
    redirect("/clients");
  }

  return (
    <HydrateClient>
      <ClientDetailPage client={client} />
    </HydrateClient>
  );
}
