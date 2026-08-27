import { createRouter, createWebHistory } from "vue-router";
import AppShell from "@/app/AppShell.vue";
import FoundationPreview from "@/shared/components/FoundationPreview.vue";
import LoginPage from "@/features/auth/pages/LoginPage.vue";
import { authGuard } from "@/router/guards/auth.guard";

// Route structure mirrors AGENTS.md §6.
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
      {
        path: "lpj",
        name: "mpm.lpj",
        component: () => import("@/features/lpj/pages/MpmLpjPage.vue"),
      },
      {
        path: "lpj/:id",
        name: "mpm.lpj.detail",
        component: () => import("@/features/lpj/components/LpjDetail.vue"),
      },
      {
        path: "budget",
        name: "mpm.budget",
        component: () => import("@/features/budgets/pages/MpmBudgetPage.vue"),
      },
      {
        path: "ormawa",
        name: "mpm.ormawa",
        component: () => import("@/features/ormawa/pages/OrmawaManagementPage.vue"),
      },
      {
        path: "activity",
        name: "mpm.activity",
        component: () => import("@/features/activity-log/pages/ActivityLogPage.vue"),
      },
      {
        path: "archive",
        name: "mpm.archive",
        component: () => import("@/shared/pages/ArchivePage.vue"),
      },
      {
        path: "profile",
        name: "mpm.profile",
        component: () => import("@/shared/pages/ProfilePage.vue"),
      },
      {
        path: "settings",
        name: "mpm.settings",
        component: () => import("@/shared/pages/SettingsPage.vue"),
      },
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
      {
        path: "reviews/proposals",
        name: "lkpka.reviews.proposals",
        component: () => import("@/features/proposals/pages/LkpkaProposalsPage.vue"),
      },
      {
        path: "reviews/proposals/:id",
        name: "lkpka.reviews.proposals.detail",
        component: () => import("@/features/proposals/components/ProposalDetail.vue"),
      },
      {
        path: "reviews/lpj",
        name: "lkpka.reviews.lpj",
        component: () => import("@/features/lpj/pages/LkpkaLpjPage.vue"),
      },
      {
        path: "reviews/lpj/:id",
        name: "lkpka.reviews.lpj.detail",
        component: () => import("@/features/lpj/components/LpjDetail.vue"),
      },
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
      {
        path: "lpj",
        name: "lkpka.lpj",
        component: () => import("@/features/lpj/pages/LkpkaLpjPage.vue"),
      },
      {
        path: "lpj/:id",
        name: "lkpka.lpj.detail",
        component: () => import("@/features/lpj/components/LpjDetail.vue"),
      },
      {
        path: "budget",
        name: "lkpka.budget",
        component: () => import("@/features/budgets/pages/MpmBudgetPage.vue"),
      },
      {
        path: "activity",
        name: "lkpka.activity",
        component: () => import("@/features/activity-log/pages/ActivityLogPage.vue"),
      },
      {
        path: "archive",
        name: "lkpka.archive",
        component: () => import("@/shared/pages/ArchivePage.vue"),
      },
      {
        path: "profile",
        name: "lkpka.profile",
        component: () => import("@/shared/pages/ProfilePage.vue"),
      },
      {
        path: "settings",
        name: "lkpka.settings",
        component: () => import("@/shared/pages/SettingsPage.vue"),
      },
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
          {
            path: "new",
            name: "ormawa.proposals.new",
            component: () => import("@/features/proposals/pages/OrmawaProposalFormPage.vue"),
          },
          {
            path: ":id",
            name: "ormawa.proposals.detail",
            component: () => import("@/features/proposals/components/ProposalDetail.vue"),
          },
          {
            path: ":id/edit",
            name: "ormawa.proposals.edit",
            component: () => import("@/features/proposals/pages/OrmawaProposalFormPage.vue"),
          },
          {
            path: ":id/history",
            name: "ormawa.proposals.history",
            component: () => import("@/features/proposals/pages/OrmawaProposalHistoryPage.vue"),
          },
        ],
      },
      {
        path: "lpj",
        children: [
          {
            path: "",
            name: "ormawa.lpj",
            component: () => import("@/features/lpj/pages/OrmawaLpjPage.vue"),
          },
          {
            path: ":id",
            name: "ormawa.lpj.detail",
            component: () => import("@/features/lpj/components/LpjDetail.vue"),
          },
          {
            path: ":id/edit",
            name: "ormawa.lpj.edit",
            component: () => import("@/features/lpj/pages/OrmawaLpjEditPage.vue"),
          },
        ],
      },
      {
        path: "archive",
        name: "ormawa.archive",
        component: () => import("@/shared/pages/ArchivePage.vue"),
      },
      {
        path: "profile",
        name: "ormawa.profile",
        component: () => import("@/shared/pages/ProfilePage.vue"),
      },
      {
        path: "settings",
        name: "ormawa.settings",
        component: () => import("@/shared/pages/SettingsPage.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Role-based navigation guard (Sprint 04).
router.beforeEach(authGuard);
