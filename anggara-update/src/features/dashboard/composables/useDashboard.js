import { useQuery } from "@tanstack/vue-query";
import { toValue } from "vue";
import {
  getMpmDashboard,
  getLkpkaDashboard,
  getOrmawaDashboard,
} from "@/features/dashboard/services/dashboard.service";

// Server-state for dashboards (AGENTS.md §4). Keys are role-scoped so each
// dashboard caches independently.
export function useMpmDashboard() {
  return useQuery({
    queryKey: ["dashboard", "mpm"],
    queryFn: getMpmDashboard,
    staleTime: 30_000,
  });
}

export function useLkpkaDashboard() {
  return useQuery({
    queryKey: ["dashboard", "lkpka"],
    queryFn: getLkpkaDashboard,
    staleTime: 30_000,
  });
}

export function useOrmawaDashboard(ormawaId) {
  return useQuery({
    queryKey: ["dashboard", "ormawa", ormawaId],
    queryFn: () => getOrmawaDashboard(toValue(ormawaId)),
    enabled: ormawaId,
    staleTime: 30_000,
  });
}
