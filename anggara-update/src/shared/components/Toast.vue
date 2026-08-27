<script setup>
import { cn } from "@/shared/lib/utils";

const props = defineProps({
  type: { type: String, default: "success" },
  message: { type: String, required: true },
  class: { type: String, default: "" },
});

const styles = {
  success: "border-success/30 bg-success-soft text-success",
  error: "border-danger/30 bg-danger-soft text-danger",
  warning: "border-warning/30 bg-warning-soft text-warning",
};

const icons = { success: "✓", error: "!", warning: "!" };
</script>

<template>
  <div
    role="status"
    :class="
      cn(
        'flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium shadow-sm',
        styles[type],
        props.class,
      )
    "
  >
    <span aria-hidden="true" class="text-base leading-none">{{ icons[type] }}</span>
    <span class="flex-1">{{ message }}</span>
  </div>
</template>
