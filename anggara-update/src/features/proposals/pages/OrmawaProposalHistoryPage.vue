<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useProposal } from "@/features/proposals/composables/useProposals";
import Skeleton from "@/shared/components/Skeleton.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import { formatDate } from "@/shared/lib/format";

const route = useRoute();
const { data, isLoading, isError, error, refetch } = useProposal(route.params.id);
const revisions = computed(() => data.value?.proposal_revisions || []);
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-text">Riwayat Revisi</h1>
      <p class="text-sm text-text-muted">{{ data?.judul_kegiatan || "Proposal" }}</p>
    </div>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat riwayat.'"
      @retry="refetch()"
    />
    <Skeleton v-else-if="isLoading" class="h-40 w-full rounded-lg" />
    <EmptyState
      v-else-if="!revisions.length"
      title="Belum ada revisi"
      description="Riwayat revisi akan muncul di sini setelah LKPKA meminta perbaikan."
    />
    <template v-else>
      <ol class="space-y-3">
        <li
          v-for="r in revisions"
          :key="r.id"
          class="rounded-lg border border-border bg-surface p-4"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-text">Versi {{ r.versi }}</span>
            <span class="text-xs text-text-muted">{{ formatDate(r.created_at) }}</span>
          </div>
          <p class="mt-1 text-sm text-text-muted">{{ r.catatan }}</p>
        </li>
      </ol>
    </template>
  </div>
</template>
