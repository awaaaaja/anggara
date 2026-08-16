import { and, count, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityLogs, profiles, proposals } from "@/lib/db/schema";

function todayStart() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

async function getSystemActor() {
  const [actor] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.role, "lkpka"))
    .limit(1);
  return actor ?? null;
}

async function logTransitions(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  rows: Array<{ id: string; judul_kegiatan: string }>,
  action: string,
  actorId: string,
) {
  if (rows.length === 0) return;
  await tx.insert(activityLogs).values(
    rows.map((r) => ({
      actor_id: actorId,
      actor_role: "system",
      action,
      target_table: "proposals",
      target_id: r.id,
      metadata: { judul: r.judul_kegiatan, sumber: "status otomatis" },
    })),
  );
}

export async function applyAutoStatusTransitions() {
  const actor = await getSystemActor();
  if (!actor) return { mulai: 0, lpjMenunggu: 0 };

  const today = todayStart();

  const [toBerlangsung, toLpjMenunggu] = await db.transaction(async (tx) => {
    const mulai = await tx
      .select({ id: proposals.id, judul_kegiatan: proposals.judul_kegiatan })
      .from(proposals)
      .where(and(eq(proposals.status, "disetujui"), lte(proposals.tanggal_mulai, today)))
      .limit(500);
    if (mulai.length > 0) {
      await tx
        .update(proposals)
        .set({ status: "kegiatan_berlangsung" })
        .where(and(eq(proposals.status, "disetujui"), lte(proposals.tanggal_mulai, today)));
      await logTransitions(tx, mulai, "proposal.auto_mulai", actor.id);
    }

    const menunggu = await tx
      .select({ id: proposals.id, judul_kegiatan: proposals.judul_kegiatan })
      .from(proposals)
      .where(
        and(eq(proposals.status, "kegiatan_berlangsung"), lte(proposals.tanggal_selesai, today)),
      )
      .limit(500);
    if (menunggu.length > 0) {
      await tx
        .update(proposals)
        .set({ status: "lpj_menunggu" })
        .where(
          and(
            eq(proposals.status, "kegiatan_berlangsung"),
            lte(proposals.tanggal_selesai, today),
          ),
        );
      await logTransitions(tx, menunggu, "proposal.auto_lpj_menunggu", actor.id);
    }

    return [mulai.length, menunggu.length];
  });

  return { mulai: toBerlangsung, lpjMenunggu: toLpjMenunggu };
}

export async function getNotificationBadges(role: "lkpka" | "ormawa", ormawaId?: string | null) {
  if (role === "lkpka") {
    const [[proposal], [lpjReview]] = await Promise.all([
      db
        .select({ total: count() })
        .from(proposals)
        .where(eq(proposals.status, "diajukan")),
      db
        .select({ total: count() })
        .from(proposals)
        .where(eq(proposals.status, "lpj_direview")),
    ]);
    return { proposal: proposal.total, lpj: lpjReview.total };
  }

  if (!ormawaId) return { ringkasan: 0, proposal: 0 };
  const today = todayStart();
  const [[revisi], [jatuhTempo]] = await Promise.all([
    db
      .select({ total: count() })
      .from(proposals)
      .where(and(eq(proposals.ormawa_id, ormawaId), eq(proposals.status, "revisi_diminta"))),
    db
      .select({ total: count() })
      .from(proposals)
      .where(
        and(
          eq(proposals.ormawa_id, ormawaId),
          eq(proposals.status, "lpj_menunggu"),
          lte(proposals.tanggal_selesai, today),
        ),
      ),
  ]);
  return { ringkasan: jatuhTempo.total, proposal: revisi.total };
}
