<script setup>
import Skeleton from "@/shared/components/Skeleton.vue";

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "—" },
  icon: { type: [Object, Function], default: null },
  hint: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">
          {{ label }}
        </p>
        <Skeleton v-if="loading" class="mt-2 h-7 w-24" />
        <p v-else class="mt-1 truncate text-2xl font-bold text-text">{{ value }}</p>
        <p v-if="hint && !loading" class="mt-1 truncate text-xs text-text-muted">
          {{ hint }}
        </p>
      </div>
      <div v-if="icon" class="shrink-0 rounded-md bg-primary-soft p-2 text-primary">
        <component :is="icon" class="size-5" />
      </div>
    </div>
  </div>
</template>
