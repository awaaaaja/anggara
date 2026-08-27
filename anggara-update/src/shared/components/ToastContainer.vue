<script setup>
import { useToast } from "@/shared/composables/useToast";
import Toast from "./Toast.vue";

const { toasts, dismiss } = useToast();
</script>

<template>
  <div
    aria-live="polite"
    aria-atomic="false"
    class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2"
  >
    <Toast
      v-for="t in toasts"
      :key="t.id"
      :type="t.type"
      :message="t.message"
      class="pointer-events-auto"
      @click="dismiss(t.id)"
    />
  </div>
</template>
