import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";
import { AppSidebar } from "~/components/layout/app-sidebar";
import { Header } from "~/components/layout/header";
import { InstallBanner } from "~/components/pwa/install-banner";
import { SyncBanner } from "~/components/sync/sync-banner";
import { SyncProvider } from "~/components/sync/sync-provider";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userProfile = await api.user.me().catch(() => null);

  if (userProfile && !userProfile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
        }}
      />
      <SidebarInset>
        <Header />
        <main className="px-4 py-6">
          <SyncProvider>
            <InstallBanner />
            <SyncBanner />
            {children}
          </SyncProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
