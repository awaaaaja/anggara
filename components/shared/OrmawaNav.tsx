import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getNotificationBadges } from "@/lib/db/queries/status-auto";
import { TabNav } from "@/components/shared/TabNav";
import { FileCheck2, FileText, LayoutDashboard } from "lucide-react";

export async function OrmawaNav({ active }: { active?: "ringkasan" | "proposal" | "lpj" }) {
  const profile = await getCurrentProfile();
  const badges = profile
    ? await getNotificationBadges("ormawa", profile.ormawa_id)
    : { ringkasan: 0, proposal: 0 };
  return (
    <TabNav
      items={[
        {
          href: "/ormawa/dashboard",
          label: "Ringkasan",
          icon: LayoutDashboard,
          active: active === "ringkasan",
          badge: badges.ringkasan,
        },
        {
          href: "/ormawa/proposals",
          label: "Proposal",
          icon: FileText,
          active: active === "proposal",
          badge: badges.proposal,
        },
        {
          href: "/ormawa/lpj",
          label: "LPJ",
          icon: FileCheck2,
          active: active === "lpj",
        },
      ]}
    />
  );
}