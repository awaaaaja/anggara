<script setup>
// Base responsive table wrapper. Rows/headers are authored by consumers.
// Desktop: standard table. Mobile card fallback is handled by feature tables later.
defineProps({
  class: { type: String, default: "" },
});
</script>

<template>
  <div class="w-full overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
    <table class="w-full border-collapse text-left text-sm text-text">
      <slot />
    </table>
  </div>
</template>
