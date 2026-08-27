import { supabase } from "@/services/supabase";

export async function listActivity({ actorRole, action, search, page = 1, pageSize = 15 } = {}) {
  let q = supabase
    .from("activity_logs")
    .select(
      "id, actor_id, actor_role, action, target_table, target_id, metadata, created_at, actor:profiles(full_name)",
      { count: "exact" },
    );

  if (actorRole) q = q.eq("actor_role", actorRole);
  if (action) q = q.eq("action", action);
  if (search) q = q.or(`action.ilike.%${search}%,target_table.ilike.%${search}%`);

  q = q.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);

  if (error) throw error;
  return { rows: data || [], total: count ?? 0 };
}
