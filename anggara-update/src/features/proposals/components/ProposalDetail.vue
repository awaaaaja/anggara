<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import Skeleton from "@/shared/components/Skeleton.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import { formatRupiah, formatDate } from "@/shared/lib/format";
import { proposalStatusLabel, proposalStatusVariant } from "@/shared/lib/status";
import { useProposal, useSubmitProposal } from "@/features/proposals/composables/useProposals";
import ReviewActions from "@/features/proposals/components/ReviewActions.vue";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const id = computed(() => route.params.id);

const { data, isLoading, isError, error, refetch } = useProposal(id);
const p = computed(() => data.value);

const anggaran = computed(() => p.value?.anggaran?.[0] || null);
const revisions = computed(() => p.value?.proposal_revisions || []);

const canSubmit = computed(
  () =>
    auth.role === "ormawa" &&
    p.value &&
    (p.value.status === "draft" || p.value.status === "revisi_diminta"),
);

const submit = useSubmitProposal();
const submitting = ref(false);
async function onAjukan() {
  submitting.value = true;
  try {
    await submit.mutateAsync(id.value);
    refetch();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <Button variant="ghost" size="sm" class="gap-1" @click="router.back()">
      <ArrowLeft class="size-4" /> Kembali
    </Button>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat proposal.'"
      @retry="refetch()"
    />

    <Skeleton v-else-if="isLoading" class="h-96 w-full rounded-lg" />

    <EmptyState
      v-else-if="!p"
      title="Proposal tidak ditemukan"
      description="Proposal mungkin telah dihapus atau Anda tidak memiliki akses."
    />

    <template v-else>
      <header class="space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-xl font-bold text-text">{{ p.judul_kegiatan }}</h1>
          <Badge :variant="proposalStatusVariant[p.status]">{{
            proposalStatusLabel[p.status]
          }}</Badge>
        </div>
        <p class="text-sm text-text-muted">
          {{ p.ormawa?.nama || "-" }}
          <span v-if="p.ormawa?.jenis"> · {{ p.ormawa.jenis }}</span>
        </p>
        <ReviewActions :proposal="p" />
        <div v-if="canSubmit" class="flex flex-wrap gap-2">
          <Button variant="default" :disabled="submitting" @click="onAjukan">Ajukan</Button>
          <Button variant="outline" @click="router.push(`/ormawa/proposals/${id}/edit`)"
            >Edit</Button
          >
          <Button variant="ghost" @click="router.push(`/ormawa/proposals/${id}/history`)"
            >Riwayat Revisi</Button
          >
        </div>
      </header>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Main info -->
        <section class="space-y-4 lg:col-span-2">
          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-3 text-sm font-semibold text-text">Informasi Kegiatan</h2>
            <dl class="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-text-muted">Anggaran Diajukan</dt>
                <dd class="font-medium text-text">
                  {{ formatRupiah(p.anggaran_diajukan) }}
                </dd>
              </div>
              <div>
                <dt class="text-text-muted">Lokasi</dt>
                <dd class="font-medium text-text">{{ p.lokasi || "-" }}</dd>
              </div>
              <div>
                <dt class="text-text-muted">Tanggal Mulai</dt>
                <dd class="font-medium text-text">
                  {{ formatDate(p.tanggal_mulai) }}
                </dd>
              </div>
              <div>
                <dt class="text-text-muted">Tanggal Selesai</dt>
                <dd class="font-medium text-text">
                  {{ formatDate(p.tanggal_selesai) }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-2 text-sm font-semibold text-text">Deskripsi</h2>
            <p class="whitespace-pre-line text-sm text-text">
              {{ p.deskripsi || "-" }}
            </p>
          </div>

          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-2 text-sm font-semibold text-text">Tujuan Kegiatan</h2>
            <p class="whitespace-pre-line text-sm text-text">
              {{ p.tujuan_kegiatan || "-" }}
            </p>
          </div>
        </section>

        <!-- Side: anggaran + revisions -->
        <aside class="space-y-4">
          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-3 text-sm font-semibold text-text">Anggaran</h2>
            <template v-if="anggaran">
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-text-muted">Disetujui</dt>
                  <dd class="font-medium text-text">
                    {{ formatRupiah(anggaran.nominal_disetujui) }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-text-muted">Ditetapkan</dt>
                  <dd class="font-medium text-text">
                    {{ formatDate(anggaran.ditetapkan_pada) }}
                  </dd>
                </div>
              </dl>
              <p v-if="anggaran.catatan_anggaran" class="mt-3 text-xs text-text-muted">
                {{ anggaran.catatan_anggaran }}
              </p>
            </template>
            <p v-else class="text-sm text-text-muted">Belum ditetapkan.</p>
          </div>

          <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 class="mb-3 text-sm font-semibold text-text">Riwayat Revisi</h2>
            <ul v-if="revisions.length" class="space-y-3 text-sm">
              <li
                v-for="r in revisions"
                :key="r.id"
                class="border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <p class="font-medium text-text">Versi {{ r.versi }}</p>
                <p class="text-text-muted">{{ r.catatan || "-" }}</p>
                <p class="mt-1 text-xs text-text-muted">
                  {{ formatDate(r.created_at) }}
                </p>
              </li>
            </ul>
            <p v-else class="text-sm text-text-muted">Belum ada revisi.</p>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
