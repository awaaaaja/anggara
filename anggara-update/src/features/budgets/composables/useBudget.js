import { useQuery } from "@tanstack/vue-query";
import { getBudgetSummary } from "@/features/budgets/services/budget.service";

export function useBudgetSummary() {
  return useQuery({
    queryKey: ["budget", "mpm"],
    queryFn: getBudgetSummary,
    staleTime: 30_000,
  });
}
