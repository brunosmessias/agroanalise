import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const user = await api.user.me();

  return (
    <HydrateClient>
      <OnboardingWizard user={user!} />
    </HydrateClient>
  );
}
