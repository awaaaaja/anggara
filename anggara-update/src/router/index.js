import { createRouter, createWebHistory } from "vue-router";
import RoutePlaceholder from "@/shared/components/RoutePlaceholder.vue";
import LayoutShell from "@/shared/components/LayoutShell.vue";
import FoundationPreview from "@/shared/components/FoundationPreview.vue";

const Placeholder = RoutePlaceholder;

// Route structure mirrors AGENTS.md §6. Pages are not implemented yet —
// they will be lazy-loaded per feature in later sprints.
const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Placeholder },
  { path: "/foundation", name: "foundation", component: FoundationPreview },

  {
    path: "/mpm",
    component: LayoutShell,
    children: [
      { path: "", redirect: { name: "mpm.dashboard" } },
      { path: "dashboard", name: "mpm.dashboard", component: Placeholder },
      { path: "proposals", name: "mpm.proposals", component: Placeholder },
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
    component: LayoutShell,
    children: [
      { path: "", redirect: { name: "lkpka.dashboard" } },
      { path: "dashboard", name: "lkpka.dashboard", component: Placeholder },
      { path: "reviews/proposals", name: "lkpka.reviews.proposals", component: Placeholder },
      {
        path: "reviews/proposals/:id",
        name: "lkpka.reviews.proposals.detail",
        component: Placeholder,
      },
      { path: "reviews/lpj", name: "lkpka.reviews.lpj", component: Placeholder },
      { path: "reviews/lpj/:id", name: "lkpka.reviews.lpj.detail", component: Placeholder },
      { path: "proposals", name: "lkpka.proposals", component: Placeholder },
      { path: "proposals/:id", name: "lkpka.proposals.detail", component: Placeholder },
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
    component: LayoutShell,
    children: [
      { path: "", redirect: { name: "ormawa.dashboard" } },
      { path: "dashboard", name: "ormawa.dashboard", component: Placeholder },
      {
        path: "proposals",
        children: [
          { path: "", name: "ormawa.proposals", component: Placeholder },
          { path: "new", name: "ormawa.proposals.new", component: Placeholder },
          { path: ":id", name: "ormawa.proposals.detail", component: Placeholder },
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

// Role-based navigation guard is implemented in Sprint 04.
// router.beforeEach(authGuard)
