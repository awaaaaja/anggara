<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <section class="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
    <p class="text-sm font-medium uppercase tracking-wide text-muted-foreground">
      Foundation placeholder
    </p>
    <h1 class="text-2xl font-semibold text-foreground">
      {{ route.name || route.path }}
    </h1>
    <p class="max-w-md text-sm text-muted-foreground">
      This route is wired in Sprint 01 but its page is implemented in a later sprint.
    </p>
  </section>
</template>
