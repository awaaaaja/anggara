import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { listActivity } from "@/features/activity-log/services/activity.service";

export function useActivity() {
  const actorRole = ref("all");
  const action = ref("all");
  const search = ref("");
  const page = ref(1);
  const pageSize = 15;

  const query = useQuery({
    queryKey: computed(() => ["activity", actorRole.value, action.value, search.value, page.value]),
    queryFn: () =>
      listActivity({
        actorRole: actorRole.value !== "all" ? actorRole.value : undefined,
        action: action.value !== "all" ? action.value : undefined,
        search: search.value || undefined,
        page: page.value,
        pageSize,
      }),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil((query.data.value?.total ?? 0) / pageSize)),
  );

  function setPage(p) {
    page.value = Math.min(Math.max(1, p), totalPages.value);
  }

  return { actorRole, action, search, page, query, totalPages, setPage };
}
