import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Users, FileText, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do seu trabalho agronômico",
};

import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DashboardClient } from "./dashboard-client";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <DashboardClient userName={session.user.name} />
    </HydrateClient>
  );
}
