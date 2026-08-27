<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import Skeleton from "@/shared/components/Skeleton.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import { formatRupiah, formatDate } from "@/shared/lib/format";
import { lpjStatusLabel, lpjStatusVariant } from "@/shared/lib/status";
import { useLpj } from "@/features/lpj/composables/useLpj";
import LpjReviewActions from "@/features/lpj/components/LpjReviewActions.vue";

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);

const { data, isLoading, isError, error, refetch } = useLpj(id);
const lpj = computed(() => data.value);

const anggaranDisetujui = computed(
  () => lpj.value?.proposal?.anggaran?.[0]?.nominal_disetujui ?? null,
);
const rincian = computed(() => lpj.value?.rincian_pengeluaran || []);
const dokumentasi = computed(() => lpj.value?.dokumentasi_kegiatan || []);
</script>

<template>
  <div class="space-y-6">
    <Button variant="ghost" size="sm" class="gap-1" @click="router.back()">
      <ArrowLeft class="size-4" /> Kembali
    </Button>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat LPJ.'"
      @retry="refetch()"
    />

    <Skeleton v-else-if="isLoading" class="h-96 w-full rounded-lg" />

    <EmptyState
      v-else-if="!lpj"
      title="LPJ tidak ditemukan"
      description="LPJ mungkin telah dihapus atau Anda tidak memiliki akses."
    />

    <template v-else>
      <header class="space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-xl font-bold text-text">
            {{ lpj.proposal?.judul_kegiatan || "LPJ" }}
          </h1>
          <Badge :variant="lpjStatusVariant[lpj.status]">{{ lpjStatusLabel[lpj.status] }}</Badge>
        </div>
        <p class="text-sm text-text-muted">
          {{ lpj.proposal?.ormawa?.nama || "-" }}
          <span v-if="lpj.proposal?.ormawa?.jenis"> · {{ lpj.proposal.ormawa.jenis }}</span>
        </p>
        <LpjReviewActions :lpj="lpj" />
      </header>

      <!-- Summary + budget vs realisasi -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section class="space-y-4 lg:col-span-2">
          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-2 text-sm font-semibold text-text">Ringkasan Penggunaan Dana</h2>
            <p class="whitespace-pre-line text-sm text-text">
              {{ lpj.ringkasan_penggunaan_dana || "-" }}
            </p>
          </div>

          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-3 text-sm font-semibold text-text">Rincian Pengeluaran</h2>
            <ul v-if="rincian.length" class="space-y-2 text-sm">
              <li
                v-for="(r, i) in rincian"
                :key="i"
                class="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p class="font-medium text-text">{{ r.item }}</p>
                  <p v-if="r.keterangan" class="text-xs text-text-muted">
                    {{ r.keterangan }}
                  </p>
                </div>
                <span class="shrink-0 font-medium text-text">{{ formatRupiah(r.jumlah) }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-text-muted">Belum ada rincian.</p>
          </div>
        </section>

        <aside class="space-y-4">
          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-3 text-sm font-semibold text-text">Anggaran</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-text-muted">Disetujui</dt>
                <dd class="font-medium text-text">
                  {{ formatRupiah(anggaranDisetujui) }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-text-muted">Realisasi</dt>
                <dd class="font-medium text-text">
                  {{ formatRupiah(lpj.total_realisasi) }}
                </dd>
              </div>
              <div class="flex justify-between border-t border-border pt-2">
                <dt class="text-text-muted">Selisih</dt>
                <dd
                  class="font-medium"
                  :class="
                    (anggaranDisetujui ?? 0) - (lpj.total_realisasi ?? 0) >= 0
                      ? 'text-text'
                      : 'text-danger'
                  "
                >
                  {{ formatRupiah((anggaranDisetujui ?? 0) - (lpj.total_realisasi ?? 0)) }}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <!-- Documentation gallery -->
      <section>
        <h2 class="mb-3 text-sm font-semibold text-text">Dokumentasi Kegiatan</h2>
        <div v-if="dokumentasi.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="d in dokumentasi"
            :key="d.id"
            class="overflow-hidden rounded-lg border border-border bg-surface"
          >
            <img
              v-if="d.file_type === 'foto'"
              :src="d.file_url"
              :alt="d.caption || 'Dokumentasi'"
              class="aspect-square w-full object-cover"
            />
            <video
              v-else-if="d.file_type === 'video'"
              :src="d.file_url"
              controls
              class="aspect-square w-full object-cover"
            />
            <a
              v-else
              :href="d.file_url"
              target="_blank"
              rel="noreferrer"
              class="flex aspect-square w-full items-center justify-center bg-surface-secondary p-3 text-center text-xs text-text-muted"
            >
              {{ d.caption || "Dokumen" }}
            </a>
            <p v-if="d.caption" class="truncate px-2 py-1 text-xs text-text-muted">
              {{ d.caption }}
            </p>
          </div>
        </div>
        <p v-else class="text-sm text-text-muted">Belum ada dokumentasi.</p>
      </section>
    </template>
  </div>
</template>
