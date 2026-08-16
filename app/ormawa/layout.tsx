import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { applyAutoStatusTransitions } from "@/lib/db/queries/status-auto";
import { AppShell } from "@/components/shared/AppShell";

export default async function OrmawaLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ormawa") redirect(`/${profile.role}/dashboard`);
  await applyAutoStatusTransitions();
  return <AppShell profile={profile}>{children}</AppShell>;
}