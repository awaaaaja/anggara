import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue } from "vue";
import { listLpj, getLpjDetail, reviewLpj } from "@/features/lpj/services/lpj.service";
import { useToast } from "@/shared/composables/useToast";
import { useAuthStore } from "@/stores/auth";

export function useLpjs(filters) {
  return useQuery({
    queryKey: computed(() => ["lpj", toValue(filters)]),
    queryFn: () => listLpj(toValue(filters)),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useLpj(id) {
  return useQuery({
    queryKey: ["lpj", id],
    queryFn: () => getLpjDetail(id),
    enabled: () => !!id,
    staleTime: 30_000,
  });
}

const MESSAGE = {
  disetujui: "LPJ disetujui",
  ditolak: "LPJ ditolak",
};

export function useReviewLpj() {
  const qc = useQueryClient();
  const toast = useToast();
  const auth = useAuthStore();
  return useMutation({
    mutationFn: (vars) => reviewLpj({ ...vars, actorRole: auth.role }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["lpj", vars.id] });
      qc.invalidateQueries({ queryKey: ["lpj"] });
      qc.invalidateQueries({ queryKey: ["dashboard", auth.role] });
      toast.success(MESSAGE[res.status] || "Review berhasil");
    },
    onError: (e) => {
      toast.error(e?.message || "Gagal memproses review LPJ");
    },
  });
}
