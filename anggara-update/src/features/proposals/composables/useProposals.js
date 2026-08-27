import { useQuery } from "@tanstack/vue-query";
import { computed, toValue } from "vue";
import { listProposals, getProposalDetail } from "@/features/proposals/services/proposal.service";

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
    queryFn: () => getProposalDetail(id),
    enabled: () => !!id,
    staleTime: 30_000,
  });
}
