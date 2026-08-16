import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getNotificationBadges } from "@/lib/db/queries/status-auto";
import { TabNav } from "@/components/shared/TabNav";

export async function OrmawaNav({ active }: { active?: "ringkasan" | "proposal" }) {
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
          active: active === "ringkasan",
          badge: badges.ringkasan,
        },
        {
          href: "/ormawa/proposals",
          label: "Proposal",
          active: active === "proposal",
          badge: badges.proposal,
        },
      ]}
    />
  );
}
