<script setup>
import { FileText, FileCheck2, Users, Wallet } from "lucide-vue-next";
import { Badge } from "@/shared/components/ui/badge";
import Skeleton from "@/shared/components/Skeleton.vue";
import StatCard from "@/shared/components/StatCard.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import Table from "@/shared/components/Table.vue";
import { formatRupiah, formatDate, formatDateTime } from "@/shared/lib/format";
import { proposalStatusLabel, proposalStatusVariant } from "@/shared/lib/status";
import { useMpmDashboard } from "@/features/dashboard/composables/useDashboard";

const { data, isLoading, isError, error, refetch } = useMpmDashboard();
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-xl font-bold text-text">Dashboard MPM</h1>
      <p class="text-sm text-text-muted">
        Ringkasan penganggaran &amp; kegiatan ORMAWA secara menyeluruh.
      </p>
    </header>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat dashboard.'"
      @retry="refetch()"
    />

    <template v-else>
      <!-- Stat cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Proposal"
          :value="data?.stats.totalProposals ?? 0"
          :icon="FileText"
          :loading="isLoading"
        />
        <StatCard
          label="Total LPJ"
          :value="data?.stats.totalLpj ?? 0"
          :icon="FileCheck2"
          :loading="isLoading"
        />
        <StatCard
          label="ORMAWA Aktif"
          :value="data?.stats.totalOrmawa ?? 0"
          :icon="Users"
          :loading="isLoading"
        />
        <StatCard
          label="Anggaran Disetujui"
          :value="formatRupiah(data?.stats.approvedBudget ?? 0)"
          :icon="Wallet"
          :loading="isLoading"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Recent proposals -->
        <section class="xl:col-span-2">
          <h2 class="mb-2 text-sm font-semibold text-text">Proposal Terbaru</h2>
          <Skeleton v-if="isLoading" class="h-48 w-full rounded-lg" />
          <EmptyState
            v-else-if="!data?.recentProposals.length"
            title="Belum ada proposal"
            description="Proposal dari ORMAWA akan muncul di sini."
          />
          <Table v-else>
            <thead>
              <tr class="border-b border-border text-xs uppercase text-text-muted">
                <th class="px-4 py-3 font-medium">Kegiatan</th>
                <th class="px-4 py-3 font-medium">ORMAWA</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 text-right font-medium">Anggaran</th>
                <th class="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in data.recentProposals"
                :key="p.id"
                class="border-b border-border last:border-0"
              >
                <td class="px-4 py-3 font-medium text-text">
                  {{ p.judul_kegiatan }}
                </td>
                <td class="px-4 py-3 text-text-muted">
                  {{ p.ormawa?.nama || "-" }}
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

        <!-- Recent activity -->
        <section>
          <h2 class="mb-2 text-sm font-semibold text-text">Aktivitas Terbaru</h2>
          <Skeleton v-if="isLoading" class="h-48 w-full rounded-lg" />
          <EmptyState v-else-if="!data?.recentActivity.length" title="Belum ada aktivitas" />
          <ul v-else class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-sm">
            <li
              v-for="a in data.recentActivity"
              :key="a.id"
              class="flex items-start justify-between gap-3 text-sm"
            >
              <div class="min-w-0">
                <p class="font-medium text-text">{{ a.action }}</p>
                <p class="text-xs text-text-muted">{{ a.target_table }} · {{ a.actor_role }}</p>
              </div>
              <span class="shrink-0 text-xs text-text-muted">{{
                formatDateTime(a.created_at)
              }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
