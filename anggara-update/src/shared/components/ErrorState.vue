<script setup>
defineProps({
  message: { type: String, default: "Gagal memuat data." },
});
const emit = defineEmits(["retry"]);
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-danger/40 bg-danger/5 px-6 py-10 text-center"
  >
    <p class="text-sm font-medium text-danger">{{ message }}</p>
    <button
      type="button"
      class="mt-3 rounded-md border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
      @click="emit('retry')"
    >
      Coba lagi
    </button>
  </div>
</template>
