import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { reviewProposal } from "@/features/proposals/services/proposal.service";
import { useToast } from "@/shared/composables/useToast";

const MESSAGE = {
  disetujui: "Proposal disetujui",
  ditolak: "Proposal ditolak",
  revisi_diminta: "Revisi diminta ke ORMAWA",
};

// Review mutation for LKPKA. Invalidates proposal/dashboard caches so the
// detail view and lists reflect the new status immediately.
export function useReviewProposal() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (vars) => reviewProposal(vars),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["proposal", vars.id] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "lkpka"] });
      toast.success(MESSAGE[res.status] || "Review berhasil");
    },
    onError: (e) => {
      toast.error(e?.message || "Gagal memproses review");
    },
  });
}
