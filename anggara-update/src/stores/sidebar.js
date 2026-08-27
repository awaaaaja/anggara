import { defineStore } from "pinia";
import { ref } from "vue";

// Client UI state for the app shell (AGENTS.md §4).
export const useSidebarStore = defineStore("sidebar", () => {
  const collapsed = ref(false);
  const mobileOpen = ref(false);

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }
  function setMobileOpen(value) {
    mobileOpen.value = value;
  }

  return { collapsed, mobileOpen, toggleCollapsed, setMobileOpen };
});
