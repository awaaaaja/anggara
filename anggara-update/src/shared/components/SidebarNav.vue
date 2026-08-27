<script setup>
import { navByRole } from "@/app/navigation";
import SidebarItem from "./SidebarItem.vue";

const props = defineProps({
  role: { type: String, default: null },
  collapsed: { type: Boolean, default: false },
  onNavigate: { type: Function, default: null },
});
</script>

<template>
  <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
    <template v-for="(group, gi) in navByRole[role] || []" :key="gi">
      <p
        v-if="group.section && !collapsed"
        class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-text-muted"
      >
        {{ group.section }}
      </p>
      <SidebarItem
        v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
        :collapsed="collapsed"
        :on-navigate="onNavigate"
      />
    </template>
  </nav>
</template>
