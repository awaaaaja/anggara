<script setup>
import { FileClock, FileCheck2, FileText, FilePlus2 } from "lucide-vue-next";
import { Badge } from "@/shared/components/ui/badge";
import Skeleton from "@/shared/components/Skeleton.vue";
import StatCard from "@/shared/components/StatCard.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import Table from "@/shared/components/Table.vue";
import { formatRupiah, formatDate } from "@/shared/lib/format";
import {
  proposalStatusLabel,
  proposalStatusVariant,
  lpjStatusLabel,
  lpjStatusVariant,
} from "@/shared/lib/status";
import { useLkpkaDashboard } from "@/features/dashboard/composables/useDashboard";

const { data, isLoading, isError, error, refetch } = useLkpkaDashboard();
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-xl font-bold text-text">Dashboard LKPKA</h1>
      <p class="text-sm text-text-muted">Antrian review proposal &amp; LPJ yang perlu diproses.</p>
    </header>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat dashboard.'"
      @retry="refetch()"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Proposal Menunggu"
          :value="data?.stats.proposalMenunggu ?? 0"
          :icon="FileClock"
          :loading="isLoading"
        />
        <StatCard
          label="LPJ Menunggu"
          :value="data?.stats.lpjMenunggu ?? 0"
          :icon="FileCheck2"
          :loading="isLoading"
        />
        <StatCard
          label="Proposal Disetujui"
          :value="data?.stats.proposalDisetujui ?? 0"
          :icon="FileText"
          :loading="isLoading"
        />
        <StatCard
          label="LPJ Disetujui"
          :value="data?.stats.lpjDisetujui ?? 0"
          :icon="FilePlus2"
          :loading="isLoading"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section>
          <h2 class="mb-2 text-sm font-semibold text-text">Proposal Perlu Review</h2>
          <Skeleton v-if="isLoading" class="h-48 w-full rounded-lg" />
          <EmptyState
            v-else-if="!data?.proposalReview.length"
            title="Tidak ada antrian"
            description="Proposal yang diajukan ORMAWA akan muncul di sini."
          />
          <Table v-else>
            <thead>
              <tr class="border-b border-border text-xs uppercase text-text-muted">
                <th class="px-4 py-3 font-medium">Kegiatan</th>
                <th class="px-4 py-3 font-medium">ORMAWA</th>
                <th class="px-4 py-3 text-right font-medium">Anggaran</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in data.proposalReview"
                :key="p.id"
                class="border-b border-border last:border-0"
              >
                <td class="px-4 py-3 font-medium text-text">
                  {{ p.judul_kegiatan }}
                </td>
                <td class="px-4 py-3 text-text-muted">
                  {{ p.ormawa?.nama || "-" }}
                </td>
                <td class="px-4 py-3 text-right text-text">
                  {{ formatRupiah(p.anggaran_diajukan) }}
                </td>
              </tr>
            </tbody>
          </Table>
        </section>

        <section>
          <h2 class="mb-2 text-sm font-semibold text-text">LPJ Perlu Review</h2>
          <Skeleton v-if="isLoading" class="h-48 w-full rounded-lg" />
          <EmptyState
            v-else-if="!data?.lpjReview.length"
            title="Tidak ada antrian"
            description="LPJ yang menunggu review akan muncul di sini."
          />
          <Table v-else>
            <thead>
              <tr class="border-b border-border text-xs uppercase text-text-muted">
                <th class="px-4 py-3 font-medium">Kegiatan</th>
                <th class="px-4 py-3 font-medium">ORMAWA</th>
                <th class="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="l in data.lpjReview"
                :key="l.id"
                class="border-b border-border last:border-0"
              >
                <td class="px-4 py-3 font-medium text-text">
                  {{ l.proposal?.judul_kegiatan || "-" }}
                </td>
                <td class="px-4 py-3 text-text-muted">
                  {{ l.proposal?.ormawa?.nama || "-" }}
                </td>
                <td class="px-4 py-3">
                  <Badge :variant="lpjStatusVariant[l.status]">{{
                    lpjStatusLabel[l.status]
                  }}</Badge>
                </td>
              </tr>
            </tbody>
          </Table>
        </section>
      </div>
    </template>
  </div>
</template>
