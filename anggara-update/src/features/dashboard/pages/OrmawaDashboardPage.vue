<script setup>
import { FileText, PencilLine, CheckCircle2, FileCheck2 } from "lucide-vue-next";
import { Badge } from "@/shared/components/ui/badge";
import Skeleton from "@/shared/components/Skeleton.vue";
import StatCard from "@/shared/components/StatCard.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import Table from "@/shared/components/Table.vue";
import { formatRupiah, formatDate } from "@/shared/lib/format";
import { proposalStatusLabel, proposalStatusVariant } from "@/shared/lib/status";
import { useOrmawaDashboard } from "@/features/dashboard/composables/useDashboard";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const { data, isLoading, isError, error, refetch } = useOrmawaDashboard(auth.ormawaId);
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-xl font-bold text-text">Dashboard ORMAWA</h1>
      <p class="text-sm text-text-muted">Pantau proposal &amp; LPJ kegiatan organisasi Anda.</p>
    </header>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat dashboard.'"
      @retry="refetch()"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Proposal Saya"
          :value="data?.stats.totalProposals ?? 0"
          :icon="FileText"
          :loading="isLoading"
        />
        <StatCard
          label="Draft / Revisi"
          :value="data?.stats.draft ?? 0"
          :icon="PencilLine"
          :loading="isLoading"
        />
        <StatCard
          label="Disetujui"
          :value="data?.stats.disetujui ?? 0"
          :icon="CheckCircle2"
          :loading="isLoading"
        />
        <StatCard
          label="LPJ Saya"
          :value="data?.stats.myLpj ?? 0"
          :icon="FileCheck2"
          :loading="isLoading"
        />
      </div>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-text">Proposal Saya</h2>
        <Skeleton v-if="isLoading" class="h-48 w-full rounded-lg" />
        <EmptyState
          v-else-if="!data?.myProposals.length"
          title="Belum ada proposal"
          description="Ajukan proposal kegiatan baru untuk mulai."
        />
        <Table v-else>
          <thead>
            <tr class="border-b border-border text-xs uppercase text-text-muted">
              <th class="px-4 py-3 font-medium">Kegiatan</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 text-right font-medium">Anggaran</th>
              <th class="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in data.myProposals"
              :key="p.id"
              class="border-b border-border last:border-0"
            >
              <td class="px-4 py-3 font-medium text-text">
                {{ p.judul_kegiatan }}
              </td>
              <td class="px-4 py-3">
                <Badge :variant="proposalStatusVariant[p.status]">{{
                  proposalStatusLabel[p.status]
                }}</Badge>
              </td>
              <td class="px-4 py-3 text-right text-text">
                {{ formatRupiah(p.anggaran_diajukan) }}
              </td>
              <td class="px-4 py-3 text-text-muted">
                {{ formatDate(p.created_at) }}
              </td>
            </tr>
          </tbody>
        </Table>
      </section>
    </template>
  </div>
</template>
