import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { AnalysisEditPage } from "./analysis-edit-client";

interface PageProps {
  params: Promise<{ id: string; analysisId: string }>;
}

export default async function AnalysisEditRoute({ params }: PageProps) {
  const { id: clientId, analysisId } = await params;
  const [client, analysis] = await Promise.all([
    api.clients.getById({ id: clientId }),
    api.analyses.getById({ id: analysisId }),
  ]);

  if (!client || !analysis) {
    redirect(`/clients/${clientId}`);
  }

  return (
    <HydrateClient>
      <AnalysisEditPage client={client} analysis={analysis} />
    </HydrateClient>
  );
}
