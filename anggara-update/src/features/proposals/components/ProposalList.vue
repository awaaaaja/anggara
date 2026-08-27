<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, ChevronRight } from "lucide-vue-next";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import Skeleton from "@/shared/components/Skeleton.vue";
import Table from "@/shared/components/Table.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import { formatRupiah, formatDate } from "@/shared/lib/format";
import { proposalStatusLabel, proposalStatusVariant } from "@/shared/lib/status";
import { useAuthStore } from "@/stores/auth";
import { useDebounce } from "@/shared/composables/useDebounce";
import { useProposals } from "@/features/proposals/composables/useProposals";

const props = defineProps({
  initialStatus: { type: String, default: "" },
});

const auth = useAuthStore();
const router = useRouter();

const searchInput = ref("");
const search = useDebounce(searchInput, 300);
const status = ref(props.initialStatus || "all");
const page = ref(1);
const pageSize = 10;

const filters = computed(() => ({
  role: auth.role,
  ormawaId: auth.ormawaId,
  status: status.value !== "all" ? status.value : undefined,
  search: search.value || undefined,
  page: page.value,
  pageSize,
}));

const { data, isLoading, isError, error, refetch } = useProposals(filters);

const total = computed(() => data.value?.total ?? 0);
const rows = computed(() => data.value?.rows ?? []);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const rangeFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize + 1));
const rangeTo = computed(() => Math.min(page.value * pageSize, total.value));

const statusOptions = Object.keys(proposalStatusLabel);

function goDetail(id) {
  router.push(`/${auth.role}/proposals/${id}`);
}
function onSearchInput() {
  page.value = 1;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
        />
        <Input
          v-model="searchInput"
          type="search"
          placeholder="Cari judul kegiatan…"
          class="pl-9"
          @input="onSearchInput"
        />
      </div>
      <Select v-model="status" @update:model-value="page = 1">
        <SelectTrigger class="w-full sm:w-52">
          <SelectValue placeholder="Semua status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua status</SelectItem>
          <SelectItem v-for="s in statusOptions" :key="s" :value="s">{{
            proposalStatusLabel[s]
          }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat proposal.'"
      @retry="refetch()"
    />

    <template v-else>
      <Skeleton v-if="isLoading" class="h-72 w-full rounded-lg" />

      <EmptyState
        v-else-if="!rows.length"
        title="Tidak ada proposal"
        description="Coba ubah filter status atau kata kunci pencarian."
      />

      <template v-else>
        <Table>
          <thead>
            <tr class="border-b border-border text-xs uppercase text-text-muted">
              <th class="px-4 py-3 text-left font-medium">Kegiatan</th>
              <th class="px-4 py-3 text-left font-medium">ORMAWA</th>
              <th class="px-4 py-3 text-left font-medium">Status</th>
              <th class="px-4 py-3 text-right font-medium">Anggaran</th>
              <th class="px-4 py-3 text-left font-medium">Tanggal</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in rows"
              :key="p.id"
              class="cursor-pointer border-b border-border last:border-0 hover:bg-surface-secondary"
              @click="goDetail(p.id)"
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
                {{ formatDate(p.tanggal_mulai) }}
              </td>
              <td class="px-4 py-3 text-right text-text-muted">
                <ChevronRight class="ml-auto size-4" />
              </td>
            </tr>
          </tbody>
        </Table>

        <!-- Pagination -->
        <div class="flex items-center justify-between gap-3 text-sm text-text-muted">
          <span>Menampilkan {{ rangeFrom }}–{{ rangeTo }} dari {{ total }}</span>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
              Berikutnya
            </Button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
