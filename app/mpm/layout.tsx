import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { AppShell } from "@/components/shared/AppShell";

export default async function MpmLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "mpm") redirect(`/${profile.role}/dashboard`);
  return <AppShell profile={profile}>{children}</AppShell>;
}