import { db } from "@/lib/db/client";
import { activityLogs } from "@/lib/db/schema";

type Insertable = { insert: typeof db.insert };

type LogActivityParams = {
  actorId: string;
  actorRole: string;
  action: string;
  targetTable: string;
  targetId: string;
  metadata?: Record<string, unknown> | null;
};

export async function logActivity(params: LogActivityParams, tx?: Insertable) {
  const target = tx ?? db;
  await target.insert(activityLogs).values({
    actor_id: params.actorId,
    actor_role: params.actorRole,
    action: params.action,
    target_table: params.targetTable,
    target_id: params.targetId,
    metadata: params.metadata ?? null,
  });
}