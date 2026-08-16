"use server";

import { z } from "zod";
import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { db, dbAsUser, queryAs } from "@/lib/db/client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  activityLogs,
  anggaran,
  dokumentasiKegiatan,
  lpj,
  ormawa,
  profiles,
  proposalRevisions,
  proposals,
} from "@/lib/db/schema";
import { logActivity } from "@/lib/db/queries/activity-log";
import { getProposalForReview, listProposalsForReview } from "@/lib/db/queries/lkpka";
import { createOrmawaSchema } from "@/lib/validations/mpm";

type ActionResult = { ok: true; id?: string } | { error: string };

type MpmGuard =
  | { ok: false; error: string }
  | { ok: true; profile: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>> };

async function guardMpm(): Promise<MpmGuard> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sesi tidak valid. Silakan login ulang." };
  if (profile.role !== "mpm")
    return { ok: false, error: "Anda tidak berwenang melakukan aksi ini." };
  return { ok: true, profile };
}

export async function getMpmSummary(userId?: string) {
  return queryAs(userId, async (q) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalBulanIni] = await q
      .select({ total: sql<number>`coalesce(sum(${anggaran.nominal_disetujui}), 0)` })
      .from(anggaran)
      .where(gte(anggaran.ditetapkan_pada, startOfMonth));

    const perStatus = await q
      .select({ status: proposals.status, total: count() })
      .from(proposals)
      .groupBy(proposals.status);

    const [totalProposal] = await q.select({ total: count() }).from(proposals);
    const [ormawaAktif] = await q
      .select({ total: count() })
      .from(ormawa)
      .where(eq(ormawa.status, "aktif"));

    const perOrmawa = await q
      .select({
        ormawaNama: ormawa.nama,
        total: sql<number>`coalesce(sum(${anggaran.nominal_disetujui}), 0)`,
      })
      .from(anggaran)
      .innerJoin(proposals, eq(anggaran.proposal_id, proposals.id))
      .innerJoin(ormawa, eq(proposals.ormawa_id, ormawa.id))
      .groupBy(ormawa.nama)
      .orderBy(desc(sql`coalesce(sum(${anggaran.nominal_disetujui}), 0)`));

    return {
      totalAnggaranBulanIni: Number(totalBulanIni?.total ?? 0),
      totalProposal: totalProposal?.total ?? 0,
      ormawaAktif: ormawaAktif?.total ?? 0,
      perStatus,
      perOrmawa,
    };
  });
}

export async function listOrmawaAdmin(
  opts: { page?: number; perPage?: number } = {},
  userId?: string,
) {
  return queryAs(userId, async (q) => {
    const perPage = opts.perPage ?? 20;
    const page = Math.max(1, opts.page ?? 1);
    const offset = (page - 1) * perPage;

    const [{ total }] = await q.select({ total: count() }).from(ormawa);
    const rows = await q
      .select({
        id: ormawa.id,
        nama: ormawa.nama,
        jenis: ormawa.jenis,
        deskripsi: ormawa.deskripsi,
        status: ormawa.status,
        created_at: ormawa.created_at,
      })
      .from(ormawa)
      .orderBy(asc(ormawa.nama))
      .limit(perPage)
      .offset(offset);

    return { rows, total, page, perPage };
  });
}

export async function createOrmawaAction(
  input: z.infer<typeof createOrmawaSchema>,
  userId?: string,
): Promise<ActionResult> {
  return queryAs(userId, async (q) => {
    const parsed = createOrmawaSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
    }
    const guard = await guardMpm();
    if (!guard.ok) return { error: guard.error };
    const { nama, jenis, deskripsi, email, password } = parsed.data;

    const admin = createAdminClient();
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !created.user) {
      return {
        error: `Gagal membuat akun login: ${authError?.message ?? "kesalahan tidak diketahui"}`,
      };
    }

    try {
      const org = await dbAsUser(guard.profile.id, async (tx) => {
        const [orgRow] = await tx
          .insert(ormawa)
          .values({ nama, jenis, deskripsi, status: "aktif", dibuat_oleh: guard.profile.id })
          .returning({ id: ormawa.id });

        await tx.insert(profiles).values({
          id: created.user.id,
          role: "ormawa",
          full_name: nama,
          ormawa_id: orgRow.id,
        });

        await logActivity({
          actorId: guard.profile.id,
          actorRole: "mpm",
          action: "ormawa.created",
          targetTable: "ormawa",
          targetId: orgRow.id,
          metadata: { email },
        });

        return orgRow;
      });

      return { ok: true, id: org.id };
    } catch (err) {
      await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
      return { error: err instanceof Error ? err.message : "Gagal menyimpan data ormawa." };
    }
  });
}

export async function toggleOrmawaStatusAction(
  ormawaId: string,
  userId?: string,
): Promise<ActionResult> {
  return queryAs(userId, async (q) => {
    const guard = await guardMpm();
    if (!guard.ok) return { error: guard.error };

    const [org] = await q
      .select({ id: ormawa.id, status: ormawa.status })
      .from(ormawa)
      .where(eq(ormawa.id, ormawaId))
      .limit(1);
    if (!org) return { error: "Ormawa tidak ditemukan." };

    const next = org.status === "aktif" ? "nonaktif" : "aktif";
    await dbAsUser(guard.profile.id, async (tx) => {
      await tx.update(ormawa).set({ status: next }).where(eq(ormawa.id, ormawaId));
      await logActivity({
        actorId: guard.profile.id,
        actorRole: "mpm",
        action: "ormawa.status_changed",
        targetTable: "ormawa",
        targetId: org.id,
        metadata: { dari: org.status, ke: next },
      });
    });
    return { ok: true };
  });
}

export async function listLpjGallery(
  opts: { page?: number; perPage?: number } = {},
  userId?: string,
) {
  return queryAs(userId, async (q) => {
    const perPage = opts.perPage ?? 6;
    const page = Math.max(1, opts.page ?? 1);
    const offset = (page - 1) * perPage;
    const galleryWhere = inArray(proposals.status, ["lpj_direview", "selesai"]);

    const [{ total }] = await q
      .select({ total: count() })
      .from(lpj)
      .innerJoin(proposals, eq(lpj.proposal_id, proposals.id))
      .where(galleryWhere);

    const rows = await q
      .select({
        proposalId: proposals.id,
        judul: proposals.judul_kegiatan,
        status: proposals.status,
        ormawaNama: ormawa.nama,
        nominalDisetujui: anggaran.nominal_disetujui,
        lpjId: lpj.id,
        ringkasan: lpj.ringkasan_penggunaan_dana,
        totalRealisasi: lpj.total_realisasi,
        fileLpjUrl: lpj.file_lpj_url,
        rincian: lpj.rincian_pengeluaran,
      })
      .from(lpj)
      .innerJoin(proposals, eq(lpj.proposal_id, proposals.id))
      .innerJoin(ormawa, eq(proposals.ormawa_id, ormawa.id))
      .leftJoin(anggaran, eq(anggaran.proposal_id, proposals.id))
      .where(galleryWhere)
      .orderBy(desc(lpj.created_at))
      .limit(perPage)
      .offset(offset);

    const lpjIds = rows.map((r) => r.lpjId);
    const docs = lpjIds.length
      ? await q
          .select({
            lpjId: dokumentasiKegiatan.lpj_id,
            fileUrl: dokumentasiKegiatan.file_url,
            fileType: dokumentasiKegiatan.file_type,
            caption: dokumentasiKegiatan.caption,
          })
          .from(dokumentasiKegiatan)
          .where(inArray(dokumentasiKegiatan.lpj_id, lpjIds))
      : [];

    return {
      rows: rows.map((r) => ({
        ...r,
        dokumentasi: docs.filter((d) => d.lpjId === r.lpjId),
      })),
      total,
      page,
      perPage,
    };
  });
}

export async function listActivityActors(userId?: string) {
  return queryAs(userId, async (q) => {
    const roles = await q
      .selectDistinct({ role: activityLogs.actor_role })
      .from(activityLogs)
      .orderBy(asc(activityLogs.actor_role));
    const actions = await q
      .selectDistinct({ action: activityLogs.action })
      .from(activityLogs)
      .orderBy(asc(activityLogs.action));
    return { roles: roles.map((r) => r.role), actions: actions.map((a) => a.action) };
  });
}

export async function listActivityLogs(
  opts: { actorRole?: string; action?: string; page: number; perPage?: number },
  userId?: string,
) {
  return queryAs(userId, async (q) => {
    const perPage = opts.perPage ?? 20;
    const offset = (opts.page - 1) * perPage;
    const conditions = [
      opts.actorRole && opts.actorRole !== "semua"
        ? eq(activityLogs.actor_role, opts.actorRole)
        : undefined,
      opts.action && opts.action !== "semua" ? eq(activityLogs.action, opts.action) : undefined,
    ].filter(Boolean) as Parameters<typeof and>[0][];
    const where = conditions.length ? and(...conditions) : undefined;

    const [{ total }] = await q.select({ total: count() }).from(activityLogs).where(where);
    const rows = await q
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        actorRole: activityLogs.actor_role,
        actorNama: profiles.full_name,
        targetTable: activityLogs.target_table,
        targetId: activityLogs.target_id,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.created_at,
      })
      .from(activityLogs)
      .leftJoin(profiles, eq(activityLogs.actor_id, profiles.id))
      .where(where)
      .orderBy(desc(activityLogs.created_at))
      .limit(perPage)
      .offset(offset);

    return { rows, total, page: opts.page, perPage };
  });
}

export { listProposalsForReview as listAllProposals, getProposalForReviewMpm };
async function getProposalForReviewMpm(proposalId: string, userId?: string) {
  return queryAs(userId, async (q) => {
    const data = await getProposalForReview(proposalId, userId);
    if (!data) return null;
    const [{ total }] = await q
      .select({ total: count() })
      .from(proposalRevisions)
      .where(eq(proposalRevisions.proposal_id, proposalId));
    return { ...data, totalRevisi: total };
  });
}
