import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue } from "vue";
import {
  listProposals,
  getProposalDetail,
  createProposal,
  updateProposal,
  submitProposal,
} from "@/features/proposals/services/proposal.service";
import { useToast } from "@/shared/composables/useToast";

// Server-state for proposal collections (AGENTS.md §4). Filter/search/page are
// part of the query key so each view is cached independently.
export function useProposals(filters) {
  return useQuery({
    queryKey: computed(() => ["proposals", toValue(filters)]),
    queryFn: () => listProposals(toValue(filters)),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useProposal(id) {
  return useQuery({
    queryKey: ["proposal", id],
    queryFn: () => getProposalDetail(toValue(id)),
    enabled: () => !!toValue(id),
    staleTime: 30_000,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ ormawaId, values }) => createProposal({ ormawaId, values }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Draft proposal berhasil dibuat");
    },
    onError: (e) => toast.error(e?.message || "Gagal membuat proposal"),
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, values }) => updateProposal({ id, values }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal berhasil diperbarui");
    },
    onError: (e) => toast.error(e?.message || "Gagal memperbarui proposal"),
  });
}

export function useSubmitProposal() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => submitProposal({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal berhasil diajukan");
    },
    onError: (e) => toast.error(e?.message || "Gagal mengajukan proposal"),
  });
}
