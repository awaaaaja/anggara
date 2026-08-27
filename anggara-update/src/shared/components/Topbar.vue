<script setup>
import { useSidebarStore } from "@/stores/sidebar";
import Breadcrumb from "./Breadcrumb.vue";
import GlobalSearch from "./GlobalSearch.vue";
import NotificationCenter from "./NotificationCenter.vue";
import UserMenu from "./UserMenu.vue";
import { Menu, Search } from "lucide-vue-next";

const emit = defineEmits(["open-search"]);
const sidebar = useSidebarStore();
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur"
  >
    <button
      type="button"
      class="rounded-md p-2 text-text-secondary hover:bg-surface-secondary hover:text-text md:hidden"
      aria-label="Buka menu"
      @click="sidebar.setMobileOpen(true)"
    >
      <Menu class="size-5" />
    </button>

    <div class="min-w-0 flex-1">
      <Breadcrumb />
    </div>

    <div class="hidden w-72 lg:block">
      <GlobalSearch :on-click="() => emit('open-search')" />
    </div>

    <button
      type="button"
      class="rounded-md p-2 text-text-secondary hover:bg-surface-secondary hover:text-text lg:hidden"
      aria-label="Pencarian"
      @click="emit('open-search')"
    >
      <Search class="size-5" />
    </button>

    <NotificationCenter />
    <UserMenu />
  </header>
</template>
