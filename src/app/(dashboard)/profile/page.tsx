import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { ProfilePage } from "./profile-page";

export default async function ProfileRoute() {
  const user = await api.user.me();

  if (!user) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <ProfilePage user={user} />
    </HydrateClient>
  );
}
