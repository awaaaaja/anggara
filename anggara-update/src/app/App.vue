<script setup>
// Root component. App shell (sidebar/topbar) is built in Sprint 03.
import ToastContainer from "@/shared/components/ToastContainer.vue";
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
