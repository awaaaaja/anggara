import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import {
  listOrmawa,
  createOrmawa,
  updateOrmawa,
  deleteOrmawa,
} from "@/features/ormawa/services/ormawa.service";
import { useToast } from "@/shared/composables/useToast";

export function useOrmawas() {
  const search = ref("");
  const page = ref(1);
  const pageSize = 10;

  const filters = computed(() => ({
    search: search.value || undefined,
    page: page.value,
    pageSize,
  }));

  const query = useQuery({
    queryKey: computed(() => ["ormawa", toSearch(filters.value)]),
    queryFn: () => listOrmawa(filters.value),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const total = computed(() => query.data.value?.total ?? 0);
  const rows = computed(() => query.data.value?.rows ?? []);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

  return { ...query, search, page, pageSize, total, rows, totalPages };
}

function toSearch(f) {
  return JSON.stringify(f);
}

export function useCreateOrmawa() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload) => createOrmawa(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ormawa"] });
      toast.success("ORMAWA berhasil ditambahkan");
    },
    onError: (e) => toast.error(e?.message || "Gagal menambahkan ORMAWA"),
  });
}

export function useUpdateOrmawa() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }) => updateOrmawa(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ormawa"] });
      toast.success("ORMAWA berhasil diperbarui");
    },
    onError: (e) => toast.error(e?.message || "Gagal memperbarui ORMAWA"),
  });
}

export function useDeleteOrmawa() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => deleteOrmawa(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ormawa"] });
      toast.success("ORMAWA berhasil dihapus");
    },
    onError: (e) => toast.error(e?.message || "Gagal menghapus ORMAWA"),
  });
}
