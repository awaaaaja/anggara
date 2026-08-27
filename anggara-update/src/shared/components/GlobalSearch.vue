<script setup>
import { Search } from "lucide-vue-next";

defineProps({
  onClick: { type: Function, default: null },
});
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-text"
    aria-label="Pencarian global"
    @click="onClick?.()"
  >
    <Search class="size-4" aria-hidden="true" />
    <span class="flex-1 text-left">Cari proposal, LPJ, ORMAWA…</span>
    <kbd
      class="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-muted sm:inline"
      >⌘K</kbd
    >
  </button>
</template>
