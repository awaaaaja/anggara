import { TabNav } from "@/components/shared/TabNav";
import { Archive, FileCheck2, FileText, LayoutDashboard, ScrollText, Users } from "lucide-react";

export function MpmNav({ active }: { active?: "ringkasan" | "proposal" | "lpj" | "ormawa" | "log" | "arsip" }) {
  return (
    <TabNav
      items={[
        { href: "/mpm/dashboard", label: "Ringkasan", icon: LayoutDashboard, active: active === "ringkasan" },
        { href: "/mpm/proposals", label: "Proposal", icon: FileText, active: active === "proposal" },
        { href: "/mpm/lpj", label: "LPJ", icon: FileCheck2, active: active === "lpj" },
        { href: "/mpm/ormawa", label: "Ormawa", icon: Users, active: active === "ormawa" },
        { href: "/mpm/activity-log", label: "Log", icon: ScrollText, active: active === "log" },
        { href: "/mpm/arsip", label: "Arsip", icon: Archive, active: active === "arsip" },
      ]}
    />
  );
}