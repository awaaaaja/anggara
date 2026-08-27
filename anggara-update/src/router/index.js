import { createRouter, createWebHistory } from "vue-router";
import RoutePlaceholder from "@/shared/components/RoutePlaceholder.vue";
import AppShell from "@/app/AppShell.vue";
import FoundationPreview from "@/shared/components/FoundationPreview.vue";
import LoginPage from "@/features/auth/pages/LoginPage.vue";
import { authGuard } from "@/router/guards/auth.guard";

const Placeholder = RoutePlaceholder;

// Route structure mirrors AGENTS.md §6. Pages are not implemented yet —
// they will be lazy-loaded per feature in later sprints.
const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: LoginPage },
  { path: "/foundation", name: "foundation", component: FoundationPreview },

  {
    path: "/mpm",
    component: AppShell,
    children: [
      { path: "", redirect: { name: "mpm.dashboard" } },
      {
        path: "dashboard",
        name: "mpm.dashboard",
        component: () => import("@/features/dashboard/pages/MpmDashboardPage.vue"),
      },
      {
        path: "proposals",
        name: "mpm.proposals",
        component: () => import("@/features/proposals/pages/MpmProposalsPage.vue"),
      },
      {
        path: "proposals/:id",
        name: "mpm.proposals.detail",
        component: () => import("@/features/proposals/components/ProposalDetail.vue"),
      },
      { path: "lpj", name: "mpm.lpj", component: Placeholder },
      { path: "budget", name: "mpm.budget", component: Placeholder },
      { path: "ormawa", name: "mpm.ormawa", component: Placeholder },
      { path: "activity", name: "mpm.activity", component: Placeholder },
      { path: "archive", name: "mpm.archive", component: Placeholder },
      { path: "profile", name: "mpm.profile", component: Placeholder },
      { path: "settings", name: "mpm.settings", component: Placeholder },
    ],
  },

  {
    path: "/lkpka",
    component: AppShell,
    children: [
      { path: "", redirect: { name: "lkpka.dashboard" } },
      {
        path: "dashboard",
        name: "lkpka.dashboard",
        component: () => import("@/features/dashboard/pages/LkpkaDashboardPage.vue"),
      },
      { path: "reviews/proposals", name: "lkpka.reviews.proposals", component: Placeholder },
      {
        path: "reviews/proposals/:id",
        name: "lkpka.reviews.proposals.detail",
        component: Placeholder,
      },
      { path: "reviews/lpj", name: "lkpka.reviews.lpj", component: Placeholder },
      { path: "reviews/lpj/:id", name: "lkpka.reviews.lpj.detail", component: Placeholder },
      {
        path: "proposals",
        name: "lkpka.proposals",
        component: () => import("@/features/proposals/pages/LkpkaProposalsPage.vue"),
      },
      {
        path: "proposals/:id",
        name: "lkpka.proposals.detail",
        component: () => import("@/features/proposals/components/ProposalDetail.vue"),
      },
      { path: "lpj", name: "lkpka.lpj", component: Placeholder },
      { path: "lpj/:id", name: "lkpka.lpj.detail", component: Placeholder },
      { path: "budget", name: "lkpka.budget", component: Placeholder },
      { path: "archive", name: "lkpka.archive", component: Placeholder },
      { path: "profile", name: "lkpka.profile", component: Placeholder },
      { path: "settings", name: "lkpka.settings", component: Placeholder },
    ],
  },

  {
    path: "/ormawa",
    component: AppShell,
    children: [
      { path: "", redirect: { name: "ormawa.dashboard" } },
      {
        path: "dashboard",
        name: "ormawa.dashboard",
        component: () => import("@/features/dashboard/pages/OrmawaDashboardPage.vue"),
      },
      {
        path: "proposals",
        children: [
          {
            path: "",
            name: "ormawa.proposals",
            component: () => import("@/features/proposals/pages/OrmawaProposalsPage.vue"),
          },
          { path: "new", name: "ormawa.proposals.new", component: Placeholder },
          {
            path: ":id",
            name: "ormawa.proposals.detail",
            component: () => import("@/features/proposals/components/ProposalDetail.vue"),
          },
          { path: ":id/edit", name: "ormawa.proposals.edit", component: Placeholder },
          { path: ":id/history", name: "ormawa.proposals.history", component: Placeholder },
        ],
      },
      {
        path: "lpj",
        children: [
          { path: "", name: "ormawa.lpj", component: Placeholder },
          { path: ":id", name: "ormawa.lpj.detail", component: Placeholder },
          { path: ":id/edit", name: "ormawa.lpj.edit", component: Placeholder },
        ],
      },
      { path: "archive", name: "ormawa.archive", component: Placeholder },
      { path: "profile", name: "ormawa.profile", component: Placeholder },
      { path: "settings", name: "ormawa.settings", component: Placeholder },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Role-based navigation guard (Sprint 04).
router.beforeEach(authGuard);
