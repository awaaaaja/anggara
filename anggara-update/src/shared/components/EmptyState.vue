<script setup>
defineProps({
  title: { type: String, default: "Belum ada data" },
  description: { type: String, default: "" },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center"
  >
    <p class="text-sm font-medium text-text">{{ title }}</p>
    <p v-if="description" class="mt-1 max-w-sm text-xs text-text-muted">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
