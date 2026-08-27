import {
  LayoutDashboard,
  FileText,
  Images,
  Users,
  ListChecks,
  Wallet,
  Archive,
  User,
  Settings,
} from "lucide-vue-next";

export const roleLabels = {
  mpm: "MPM",
  lkpka: "LKPKA",
  ormawa: "ORMAWA",
};

// Navigation per role (AGENTS.md §6 route map + DESIGN.md §11 grouping).
// `to` matches a declared route so RouterLink active state works for nested paths.
export const navByRole = {
  mpm: [
    { section: null, items: [{ label: "Dashboard", to: "/mpm/dashboard", icon: LayoutDashboard }] },
    {
      section: "Workflow",
      items: [
        { label: "Proposals", to: "/mpm/proposals", icon: FileText },
        { label: "LPJ", to: "/mpm/lpj", icon: Images },
        { label: "ORMAWA", to: "/mpm/ormawa", icon: Users },
      ],
    },
    {
      section: "Monitoring",
      items: [
        { label: "Budget", to: "/mpm/budget", icon: Wallet },
        { label: "Activity", to: "/mpm/activity", icon: ListChecks },
      ],
    },
    {
      section: "System",
      items: [
        { label: "Archive", to: "/mpm/archive", icon: Archive },
        { label: "Profile", to: "/mpm/profile", icon: User },
        { label: "Settings", to: "/mpm/settings", icon: Settings },
      ],
    },
  ],
  lkpka: [
    {
      section: null,
      items: [{ label: "Dashboard", to: "/lkpka/dashboard", icon: LayoutDashboard }],
    },
    {
      section: "Workflow",
      items: [
        { label: "Review Proposal", to: "/lkpka/reviews/proposals", icon: FileText },
        { label: "Review LPJ", to: "/lkpka/reviews/lpj", icon: Images },
        { label: "Proposals", to: "/lkpka/proposals", icon: FileText },
        { label: "LPJ", to: "/lkpka/lpj", icon: Images },
      ],
    },
    {
      section: "Monitoring",
      items: [
        { label: "Budget", to: "/lkpka/budget", icon: Wallet },
        { label: "Activity", to: "/lkpka/activity", icon: ListChecks },
      ],
    },
    {
      section: "System",
      items: [
        { label: "Archive", to: "/lkpka/archive", icon: Archive },
        { label: "Profile", to: "/lkpka/profile", icon: User },
        { label: "Settings", to: "/lkpka/settings", icon: Settings },
      ],
    },
  ],
  ormawa: [
    {
      section: null,
      items: [{ label: "Dashboard", to: "/ormawa/dashboard", icon: LayoutDashboard }],
    },
    {
      section: "Workflow",
      items: [
        { label: "Proposals", to: "/ormawa/proposals", icon: FileText },
        { label: "LPJ", to: "/ormawa/lpj", icon: Images },
      ],
    },
    {
      section: "System",
      items: [
        { label: "Archive", to: "/ormawa/archive", icon: Archive },
        { label: "Profile", to: "/ormawa/profile", icon: User },
        { label: "Settings", to: "/ormawa/settings", icon: Settings },
      ],
    },
  ],
};

export function roleFromPath(path) {
  const seg = path.split("/").filter(Boolean)[0];
  return ["mpm", "lkpka", "ormawa"].includes(seg) ? seg : null;
}
