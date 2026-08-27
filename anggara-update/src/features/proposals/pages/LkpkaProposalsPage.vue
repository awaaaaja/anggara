<script setup>
import ProposalList from "@/features/proposals/components/ProposalList.vue";
</script>

<template>
  <div class="space-y-4">
    <header>
      <h1 class="text-xl font-bold text-text">Proposal</h1>
      <p class="text-sm text-text-muted">
        Review proposal ORMAWA. Gunakan filter untuk antrian review.
      </p>
    </header>
    <ProposalList initial-status="diajukan" />
  </div>
</template>
