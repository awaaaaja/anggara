<script setup>
import LpjList from "@/features/lpj/components/LpjList.vue";
</script>

<template>
  <div class="space-y-4">
    <header>
      <h1 class="text-xl font-bold text-text">LPJ</h1>
      <p class="text-sm text-text-muted">Review LPJ ORMAWA. Gunakan filter untuk antrian review.</p>
    </header>
    <LpjList initial-status="menunggu" />
  </div>
</template>
