<script setup>
import { computed } from "vue";
import { Wallet, Receipt, PiggyBank } from "lucide-vue-next";
import StatCard from "@/shared/components/StatCard.vue";
import Skeleton from "@/shared/components/Skeleton.vue";
import Table from "@/shared/components/Table.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import { formatRupiah } from "@/shared/lib/format";
import { useBudgetSummary } from "@/features/budgets/composables/useBudget";

const { data, isLoading, isError, error, refetch } = useBudgetSummary();

const perOrmawa = computed(() => data.value?.perOrmawa || []);
const maxApproved = computed(() => Math.max(0, ...perOrmawa.value.map((o) => o.approved || 0)));
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-xl font-bold text-text">Anggaran</h1>
      <p class="text-sm text-text-muted">
        Overview anggaran disetujui, realisasi LPJ, dan sisa per ORMAWA.
      </p>
    </header>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat anggaran.'"
      @retry="refetch()"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Disetujui"
          :value="formatRupiah(data?.totalApproved ?? 0)"
          :icon="Wallet"
          :loading="isLoading"
        />
        <StatCard
          label="Total Realisasi LPJ"
          :value="formatRupiah(data?.totalRealisasi ?? 0)"
          :icon="Receipt"
          :loading="isLoading"
        />
        <StatCard
          label="Sisa Anggaran"
          :value="formatRupiah(data?.sisa ?? 0)"
          :icon="PiggyBank"
          :loading="isLoading"
        />
      </div>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-text">Breakdown per ORMAWA</h2>
        <Skeleton v-if="isLoading" class="h-64 w-full rounded-lg" />
        <EmptyState
          v-else-if="!perOrmawa.length"
          title="Belum ada data anggaran"
          description="Anggaran akan muncul setelah LKPKA menyetujui proposal."
        />

        <Table v-else>
          <thead>
            <tr class="border-b border-border text-xs uppercase text-text-muted">
              <th class="px-4 py-3 text-left font-medium">ORMAWA</th>
              <th class="px-4 py-3 text-right font-medium">Disetujui</th>
              <th class="px-4 py-3 text-right font-medium">Realisasi</th>
              <th class="px-4 py-3 text-right font-medium">Sisa</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in perOrmawa"
              :key="o.ormawaId"
              class="border-b border-border last:border-0"
            >
              <td class="px-4 py-3">
                <div class="font-medium text-text">{{ o.nama }}</div>
                <div
                  class="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-secondary"
                >
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{
                      width: maxApproved ? `${((o.approved || 0) / maxApproved) * 100}%` : '0%',
                    }"
                  />
                </div>
              </td>
              <td class="px-4 py-3 text-right text-text">
                {{ formatRupiah(o.approved) }}
              </td>
              <td class="px-4 py-3 text-right text-text">
                {{ formatRupiah(o.realisasi) }}
              </td>
              <td
                class="px-4 py-3 text-right font-medium"
                :class="(o.sisa ?? 0) >= 0 ? 'text-text' : 'text-danger'"
              >
                {{ formatRupiah(o.sisa) }}
              </td>
            </tr>
          </tbody>
        </Table>
      </section>
    </template>
  </div>
</template>
