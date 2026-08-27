<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";
import { roleFromPath, roleLabels, navByRole } from "@/app/navigation";
import { ChevronRight } from "lucide-vue-next";

const route = useRoute();

const crumbs = computed(() => {
  const role = roleFromPath(route.path);
  if (!role) return [];
  const out = [{ label: roleLabels[role], to: `/${role}/dashboard` }];
  for (const group of navByRole[role] || []) {
    for (const item of group.items) {
      if (route.path === item.to || route.path.startsWith(item.to + "/")) {
        out.push({ label: item.label, to: item.to });
        return out;
      }
    }
  }
  return out;
});
</script>

<template>
  <nav aria-label="Breadcrumb" class="min-w-0">
    <ol class="flex items-center gap-1.5 text-sm text-text-muted">
      <li v-for="(c, i) in crumbs" :key="c.label + i" class="flex min-w-0 items-center gap-1.5">
        <ChevronRight v-if="i > 0" class="size-4 shrink-0" aria-hidden="true" />
        <RouterLink
          v-if="c.to && i < crumbs.length - 1"
          :to="c.to"
          class="truncate hover:text-text"
          >{{ c.label }}</RouterLink
        >
        <span v-else class="truncate font-medium text-text" aria-current="page">{{ c.label }}</span>
      </li>
    </ol>
  </nav>
</template>
