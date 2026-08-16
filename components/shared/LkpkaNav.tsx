import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getNotificationBadges } from "@/lib/db/queries/status-auto";
import { TabNav } from "@/components/shared/TabNav";
import { Archive, FileCheck2, FileText, LayoutDashboard } from "lucide-react";

export async function LkpkaNav({
  active,
}: {
  active?: "ringkasan" | "proposal" | "lpj" | "arsip";
}) {
  const profile = await getCurrentProfile();
  const badges = profile ? await getNotificationBadges("lkpka") : { proposal: 0, lpj: 0 };
  return (
    <TabNav
      items={[
        {
          href: "/lkpka/dashboard",
          label: "Ringkasan",
          icon: LayoutDashboard,
          active: active === "ringkasan",
        },
        {
          href: "/lkpka/proposals",
          label: "Proposal",
          icon: FileText,
          active: active === "proposal",
          badge: badges.proposal,
        },
        {
          href: "/lkpka/lpj",
          label: "LPJ",
          icon: FileCheck2,
          active: active === "lpj",
          badge: badges.lpj,
        },
        {
          href: "/lkpka/arsip",
          label: "Arsip",
          icon: Archive,
          active: active === "arsip",
        },
      ]}
    />
  );
}