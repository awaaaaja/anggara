import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { AppShell } from "@/components/shared/AppShell";

export default async function LkpkaLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "lkpka") redirect(`/${profile.role}/dashboard`);
  return <AppShell profile={profile}>{children}</AppShell>;
}