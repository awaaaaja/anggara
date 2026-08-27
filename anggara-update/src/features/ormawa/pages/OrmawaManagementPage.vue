<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Pencil, Trash2, Search } from "lucide-vue-next";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import Skeleton from "@/shared/components/Skeleton.vue";
import Table from "@/shared/components/Table.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";
import { useDebounce } from "@/shared/composables/useDebounce";
import { useToast } from "@/shared/composables/useToast";
import {
  useOrmawas,
  useCreateOrmawa,
  useUpdateOrmawa,
  useDeleteOrmawa,
} from "@/features/ormawa/composables/useOrmawa";
import { ormawaJenisOptions, ormawaStatusOptions } from "@/features/ormawa/schemas/ormawa.schema";
import OrmawaFormDialog from "@/features/ormawa/components/OrmawaFormDialog.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const toast = useToast();

const { data, isLoading, isError, error, refetch, search, page, total, rows, totalPages } =
  useOrmawas();
const searchInput = ref("");
const debounced = useDebounce(searchInput, 300);
search.value = debounced;

const dialogOpen = ref(false);
const editing = ref(null);

const confirmOpen = ref(false);
const deletingId = ref(null);

const create = useCreateOrmawa();
const update = useUpdateOrmawa();
const remove = useDeleteOrmawa();

const jenisLabel = (v) => ormawaJenisOptions.find((o) => o.value === v)?.label || v;
const statusVariant = (v) => (v === "aktif" ? "default" : "secondary");

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}
function openEdit(row) {
  editing.value = row;
  dialogOpen.value = true;
}
function onSave({ id, payload }) {
  if (id) update.mutate({ id, payload }, { onSuccess: () => (dialogOpen.value = false) });
  else create.mutate(payload, { onSuccess: () => (dialogOpen.value = false) });
}
function askDelete(row) {
  deletingId.value = row.id;
  confirmOpen.value = true;
}
function confirmDelete() {
  remove.mutate(deletingId.value, { onSuccess: () => (confirmOpen.value = false) });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-text">ORMAWA</h1>
        <p class="text-sm text-text-muted">Kelola organisasi mahasiswa terdaftar.</p>
      </div>
      <Button @click="openCreate"><Plus class="mr-1 size-4" /> Tambah ORMAWA</Button>
    </div>

    <div class="relative max-w-sm">
      <Search
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <Input v-model="searchInput" type="search" placeholder="Cari ORMAWA…" class="pl-9" />
    </div>

    <ErrorState
      v-if="isError"
      :message="error?.message || 'Gagal memuat data ORMAWA.'"
      @retry="refetch()"
    />
    <template v-else>
      <Skeleton v-if="isLoading" class="h-72 w-full rounded-lg" />
      <EmptyState
        v-else-if="!rows.length"
        title="Belum ada ORMAWA"
        description="Tambahkan organisasi mahasiswa untuk mulai menggunakan sistem."
      />
      <template v-else>
        <Table>
          <thead>
            <tr class="border-b border-border text-xs uppercase text-text-muted">
              <th class="px-4 py-3 text-left font-medium">Nama</th>
              <th class="px-4 py-3 text-left font-medium">Jenis</th>
              <th class="px-4 py-3 text-left font-medium">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in rows"
              :key="o.id"
              class="border-b border-border last:border-0 hover:bg-surface-secondary"
            >
              <td class="px-4 py-3">
                <p class="font-medium text-text">{{ o.nama }}</p>
                <p class="text-xs text-text-muted">{{ o.deskripsi || "-" }}</p>
              </td>
              <td class="px-4 py-3 text-text-muted">{{ jenisLabel(o.jenis) }}</td>
              <td class="px-4 py-3">
                <Badge :variant="statusVariant(o.status)">{{ o.status }}</Badge>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="outline" size="sm" @click="openEdit(o)">
                    <Pencil class="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" class="text-danger" @click="askDelete(o)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
        <div class="flex items-center justify-between gap-3 text-sm text-text-muted">
          <span>Menampilkan {{ rows.length }} dari {{ total }}</span>
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

    <OrmawaFormDialog v-model:open="dialogOpen" :ormawa="editing" @save="onSave" />

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Hapus ORMAWA"
      description="Data ORMAWA akan dihapus. Tindakan ini tidak dapat dibatalkan."
      @confirm="confirmDelete"
    />
  </div>
</template>
