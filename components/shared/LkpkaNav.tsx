import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getNotificationBadges } from "@/lib/db/queries/status-auto";
import { TabNav } from "@/components/shared/TabNav";

export async function LkpkaNav({ active }: { active?: "ringkasan" | "proposal" | "lpj" }) {
  const profile = await getCurrentProfile();
  const badges = profile ? await getNotificationBadges("lkpka") : { proposal: 0, lpj: 0 };
  return (
    <TabNav
      items={[
        { href: "/lkpka/dashboard", label: "Ringkasan", active: active === "ringkasan" },
        { href: "/lkpka/proposals", label: "Proposal", active: active === "proposal", badge: badges.proposal },
        { href: "/lkpka/lpj", label: "LPJ", active: active === "lpj", badge: badges.lpj },
      ]}
    />
  );
}
