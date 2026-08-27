<script setup>
import ProposalList from "@/features/proposals/components/ProposalList.vue";
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-text">Arsip</h1>
      <p class="text-sm text-text-muted">Proposal yang telah selesai diproses.</p>
    </div>
    <ProposalList initial-status="selesai" />
  </div>
</template>
