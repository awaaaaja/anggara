<script setup>
import { RouterLink } from "vue-router";
import { cn } from "@/shared/lib/utils";

const props = defineProps({
  to: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  collapsed: { type: Boolean, default: false },
  onNavigate: { type: Function, default: null },
});
</script>

<template>
  <RouterLink v-slot="{ href, isActive, navigate }" :to="to" custom>
    <a
      :href="href"
      :aria-current="isActive ? 'page' : undefined"
      :title="collapsed ? label : undefined"
      :class="
        cn(
          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-text-secondary hover:bg-surface-secondary hover:text-text',
        )
      "
      @click="
        (e) => {
          navigate(e);
          onNavigate?.();
        }
      "
    >
      <component :is="icon" class="size-5 shrink-0" aria-hidden="true" />
      <span v-if="!collapsed" class="truncate">{{ label }}</span>
    </a>
  </RouterLink>
</template>
