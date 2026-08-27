<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { useSidebarStore } from "@/stores/sidebar";
import { roleFromPath, roleLabels } from "@/app/navigation";
import SidebarNav from "./SidebarNav.vue";
import { ChevronsLeft } from "lucide-vue-next";

const route = useRoute();
const sidebar = useSidebarStore();
const role = computed(() => roleFromPath(route.path));

function closeMobile() {
  sidebar.setMobileOpen(false);
}
</script>

<template>
  <!-- Desktop sidebar -->
  <aside
    class="hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-[220ms] ease-in-out md:sticky md:top-0 md:flex md:h-screen"
    :class="sidebar.collapsed ? 'w-[72px]' : 'w-[248px]'"
  >
    <div
      class="flex h-16 items-center gap-2 border-b border-border px-4"
      :class="sidebar.collapsed ? 'justify-center' : 'justify-between'"
    >
      <span class="text-lg font-bold text-primary" :class="sidebar.collapsed ? 'sr-only' : ''">
        ANGGARA
      </span>
      <span
        v-if="sidebar.collapsed"
        class="flex size-9 items-center justify-center rounded-md bg-primary-soft text-lg font-bold text-primary"
        >A</span
      >
      <button
        type="button"
        class="hidden rounded-md p-1.5 text-text-muted hover:bg-surface-secondary hover:text-text md:inline-flex"
        aria-label="Ciutkan sidebar"
        @click="sidebar.toggleCollapsed()"
      >
        <ChevronsLeft
          class="size-5 transition-transform"
          :class="sidebar.collapsed ? 'rotate-180' : ''"
        />
      </button>
    </div>

    <SidebarNav :role="role" :collapsed="sidebar.collapsed" />

    <div
      v-if="!sidebar.collapsed && role"
      class="border-t border-border px-4 py-3 text-xs font-medium text-text-muted"
    >
      {{ roleLabels[role] }}
    </div>
  </aside>

  <!-- Mobile drawer -->
  <Sheet :open="sidebar.mobileOpen" @update:open="sidebar.setMobileOpen">
    <SheetContent side="left" class="w-[248px] max-w-[80vw] p-0">
      <div class="flex h-16 items-center border-b border-border px-4">
        <span class="text-lg font-bold text-primary">ANGGARA</span>
      </div>
      <SidebarNav :role="role" :collapsed="false" :on-navigate="closeMobile" />
    </SheetContent>
  </Sheet>
</template>
