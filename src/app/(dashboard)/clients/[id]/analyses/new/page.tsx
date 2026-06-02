import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { AnalysisNewPage } from "./analysis-new-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AnalysisNewRoute({ params }: PageProps) {
  const { id } = await params;
  const client = await api.clients.getById({ id });

  if (!client) {
    redirect("/clients");
  }

  return (
    <HydrateClient>
      <AnalysisNewPage client={client} />
    </HydrateClient>
  );
}
