import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userProfile = await api.user.me().catch(() => null);

  if (userProfile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
