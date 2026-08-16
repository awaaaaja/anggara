"use server";

import { z } from "zod";
import { and, asc, count, desc, eq, gte, inArray, lt, or, sql } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { db, dbAsUser } from "@/lib/db/client";
import {
  activityLogs,
  anggaran,
  dokumentasiKegiatan,
  lpj,
  ormawa,
  proposalRevisions,
  proposals,
  type StatusProposal,
} from "@/lib/db/schema";
import { logActivity } from "@/lib/db/queries/activity-log";
import { getProposalForReview } from "@/lib/db/queries/lkpka";
import { proposalFormSchema } from "@/lib/validations/proposal";
import { fileDokumentasiSchema, rincianPengeluaranSchema } from "@/lib/validations/lpj";

type ActionResult = { ok: true; id?: string } | { error: string };

type OrmawaGuard =
  | { ok: false; error: string }
  | {
      ok: true;
      profile: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>> & { ormawa_id: string };
    };

async function guardOrmawa(): Promise<OrmawaGuard> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sesi tidak valid. Silakan login ulang." };
  if (profile.role !== "ormawa") return { ok: false, error: "Anda tidak berwenang melakukan aksi ini." };
  if (!profile.ormawa_id) return { ok: false, error: "Profil Anda belum terhubung ke organisasi." };
  return { ok: true, profile: profile as OrmawaGuard extends { ok: true } ? OrmawaGuard["profile"] : never };
}

async function requireOrmawaAktif(ormawaId: string): Promise<string | null> {
  const [row] = await db
    .select({ status: ormawa.status })
    .from(ormawa)
    .where(eq(ormawa.id, ormawaId))
    .limit(1);
  if (!row || row.status !== "aktif") {
    return "Organisasi Anda berstatus nonaktif. Hubungi MPM untuk mengaktifkannya kembali.";
  }
  return null;
}

export async function getOrmawaSummary(ormawaId: string) {
  const [draft] = await db
    .select({ total: count() })
    .from(proposals)
    .where(and(eq(proposals.ormawa_id, ormawaId), eq(proposals.status, "draft")));
  const [menungguReview] = await db
    .select({ total: count() })
    .from(proposals)
    .where(and(eq(proposals.ormawa_id, ormawaId), eq(proposals.status, "diajukan")));
  const [revisiDiminta] = await db
    .select({ total: count() })
    .from(proposals)
    .where(and(eq(proposals.ormawa_id, ormawaId), eq(proposals.status, "revisi_diminta")));
  const [ditolak] = await db
    .select({ total: count() })
    .from(proposals)
    .where(and(eq(proposals.ormawa_id, ormawaId), eq(proposals.status, "ditolak")));
  const [berjalan] = await db
    .select({ total: count() })
    .from(proposals)
    .where(
      and(
        eq(proposals.ormawa_id, ormawaId),
        inArray(proposals.status, ["disetujui", "kegiatan_berlangsung", "lpj_menunggu", "lpj_direview"]),
      ),
    );
  const [selesai] = await db
    .select({ total: count() })
    .from(proposals)
    .where(and(eq(proposals.ormawa_id, ormawaId), eq(proposals.status, "selesai")));
  const [totalAnggaran] = await db
    .select({ total: sql<string>`coalesce(sum(${anggaran.nominal_disetujui}), 0)` })
    .from(anggaran)
    .innerJoin(proposals, eq(proposals.id, anggaran.proposal_id))
    .where(eq(proposals.ormawa_id, ormawaId));
  const proposalTerkini = await db
    .select({
      id: proposals.id,
      judul_kegiatan: proposals.judul_kegiatan,
      status: proposals.status,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
    })
    .from(proposals)
    .where(eq(proposals.ormawa_id, ormawaId))
    .orderBy(desc(proposals.created_at))
    .limit(5);

  return {
    draft: draft?.total ?? 0,
    menungguReview: menungguReview?.total ?? 0,
    revisiDiminta: revisiDiminta?.total ?? 0,
    ditolak: ditolak?.total ?? 0,
    berjalan: berjalan?.total ?? 0,
    selesai: selesai?.total ?? 0,
    totalAnggaranDisetujui: Number(totalAnggaran?.total ?? 0),
    proposalTerkini,
  };
}

export async function getOrmawaTahunOptions(ormawaId: string) {
  const rows = await db
    .select({ tahun: sql<string>`distinct extract(year from ${proposals.created_at})` })
    .from(proposals)
    .where(eq(proposals.ormawa_id, ormawaId))
    .orderBy(desc(sql`extract(year from ${proposals.created_at})`));
  return rows.map((r) => Number(r.tahun));
}

export async function listProposalsOrmawa(opts: {
  ormawaId: string;
  status?: string;
  tahun?: string;
  page: number;
  perPage?: number;
}) {
  const perPage = opts.perPage ?? 20;
  const offset = (opts.page - 1) * perPage;
  const conditions = [
    eq(proposals.ormawa_id, opts.ormawaId),
    opts.status && opts.status !== "semua"
      ? eq(proposals.status, opts.status as StatusProposal)
      : undefined,
    opts.tahun
      ? and(gte(proposals.created_at, new Date(`${opts.tahun}-01-01T00:00:00Z`)), lt(proposals.created_at, new Date(`${Number(opts.tahun) + 1}-01-01T00:00:00Z`)))
      : undefined,
  ].filter(Boolean) as Parameters<typeof and>[0][];

  const where = and(...conditions);
  const [{ total }] = await db.select({ total: count() }).from(proposals).where(where);
  const rows = await db
    .select({
      id: proposals.id,
      judul_kegiatan: proposals.judul_kegiatan,
      status: proposals.status,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
      anggaran_diajukan: proposals.anggaran_diajukan,
      versi_revisi: proposals.versi_revisi,
      file_proposal_url: proposals.file_proposal_url,
      created_at: proposals.created_at,
    })
    .from(proposals)
    .where(where)
    .orderBy(desc(proposals.created_at))
    .limit(perPage)
    .offset(offset);

  return { rows, total, page: opts.page, perPage };
}

export async function getProposalForOrmawa(proposalId: string, ormawaId: string) {
  const [own] = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(and(eq(proposals.id, proposalId), eq(proposals.ormawa_id, ormawaId)))
    .limit(1);
  if (!own) return null;
  return getProposalForReview(proposalId);
}

export async function listLpjOrmawa(ormawaId: string) {
  return db
    .select({
      proposalId: proposals.id,
      judul: proposals.judul_kegiatan,
      tanggalMulai: proposals.tanggal_mulai,
      tanggalSelesai: proposals.tanggal_selesai,
      status: proposals.status,
      lpjStatus: lpj.status,
      lpjCatatan: lpj.catatan_review,
      totalRealisasi: lpj.total_realisasi,
      fileLpjUrl: lpj.file_lpj_url,
      createdAt: proposals.created_at,
    })
    .from(proposals)
    .leftJoin(lpj, eq(lpj.proposal_id, proposals.id))
    .where(eq(proposals.ormawa_id, ormawaId))
    .orderBy(desc(proposals.created_at));
}

export async function getProposalTimeline(proposalId: string, ormawaId: string) {
  const [own] = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(and(eq(proposals.id, proposalId), eq(proposals.ormawa_id, ormawaId)))
    .limit(1);
  if (!own) return [];
  const lpjIds = await db
    .select({ id: lpj.id })
    .from(lpj)
    .where(eq(lpj.proposal_id, proposalId));
  const logs = await db
    .select({
      waktu: activityLogs.created_at,
      action: activityLogs.action,
      actorRole: activityLogs.actor_role,
      metadata: activityLogs.metadata,
    })
    .from(activityLogs)
    .where(
      or(
        and(eq(activityLogs.target_table, "proposals"), eq(activityLogs.target_id, proposalId)),
        and(eq(activityLogs.target_table, "lpj"), inArray(activityLogs.target_id, lpjIds.map((l) => l.id))),
      ),
    )
    .orderBy(asc(activityLogs.created_at));
  return logs;
}

export async function createProposalAction(
  formData: FormData,
): Promise<ActionResult> {
  const mode: "draft" | "diajukan" = formData.get("mode") === "draft" ? "draft" : "diajukan";
  const parsed = proposalFormSchema.safeParse({
    judul_kegiatan: formData.get("judul_kegiatan"),
    divisi_pengaju: formData.get("divisi_pengaju") || undefined,
    deskripsi: formData.get("deskripsi"),
    tujuan_kegiatan: formData.get("tujuan_kegiatan"),
    tanggal_mulai: formData.get("tanggal_mulai"),
    tanggal_selesai: formData.get("tanggal_selesai"),
    lokasi: formData.get("lokasi"),
    anggaran_diajukan: formData.get("anggaran_diajukan"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const guard = await guardOrmawa();
  if (!guard.ok) return { error: guard.error };
  const { profile } = guard;

  const nonaktif = await requireOrmawaAktif(profile.ormawa_id);
  if (nonaktif) return { error: nonaktif };

  const data = parsed.data;
  const fileProposalUrl = formData.get("fileProposalUrl");
  if (fileProposalUrl && typeof fileProposalUrl !== "string") {
    return { error: "Data PDF proposal tidak valid." };
  }
  const inserted = await dbAsUser(profile.id, async (tx) => {
    const [row] = await tx
      .insert(proposals)
      .values({
        ormawa_id: profile.ormawa_id,
        judul_kegiatan: data.judul_kegiatan,
        divisi_pengaju: data.divisi_pengaju ?? null,
        deskripsi: data.deskripsi,
        tujuan_kegiatan: data.tujuan_kegiatan,
        tanggal_mulai: new Date(data.tanggal_mulai),
        tanggal_selesai: new Date(data.tanggal_selesai),
        lokasi: data.lokasi,
        anggaran_diajukan: String(data.anggaran_diajukan),
        file_proposal_url: typeof fileProposalUrl === "string" ? fileProposalUrl : null,
        status: mode,
      })
      .returning({ id: proposals.id });
    await logActivity(
      {
        actorId: profile.id,
        actorRole: "ormawa",
        action: mode === "diajukan" ? "proposal.submit" : "proposal.draft",
        targetTable: "proposals",
        targetId: row.id,
        metadata: { judul: data.judul_kegiatan },
      },
      tx,
    );
    return row;
  });

  return { ok: true, id: inserted.id };
}

export async function resubmitProposalAction(formData: FormData): Promise<ActionResult> {
  const parsed = proposalFormSchema.safeParse({
    judul_kegiatan: formData.get("judul_kegiatan"),
    divisi_pengaju: formData.get("divisi_pengaju") || undefined,
    deskripsi: formData.get("deskripsi"),
    tujuan_kegiatan: formData.get("tujuan_kegiatan"),
    tanggal_mulai: formData.get("tanggal_mulai"),
    tanggal_selesai: formData.get("tanggal_selesai"),
    lokasi: formData.get("lokasi"),
    anggaran_diajukan: formData.get("anggaran_diajukan"),
  });
  const proposalId = formData.get("proposalId");
  if (typeof proposalId !== "string" || !proposalId) {
    return { error: "Proposal tidak valid." };
  }
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const guard = await guardOrmawa();
  if (!guard.ok) return { error: guard.error };
  const { profile } = guard;

  const nonaktif = await requireOrmawaAktif(profile.ormawa_id);
  if (nonaktif) return { error: nonaktif };

  const [proposal] = await db
    .select({
      id: proposals.id,
      ormawa_id: proposals.ormawa_id,
      status: proposals.status,
      versi_revisi: proposals.versi_revisi,
      judul_kegiatan: proposals.judul_kegiatan,
      divisi_pengaju: proposals.divisi_pengaju,
      deskripsi: proposals.deskripsi,
      tujuan_kegiatan: proposals.tujuan_kegiatan,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
      lokasi: proposals.lokasi,
      anggaran_diajukan: proposals.anggaran_diajukan,
      catatan_review: proposals.catatan_review,
    })
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);
  if (!proposal || proposal.ormawa_id !== profile.ormawa_id) {
    return { error: "Proposal tidak ditemukan." };
  }
  if (proposal.status !== "revisi_diminta") {
    return { error: "Proposal tidak dalam status revisi diminta." };
  }

  const data = parsed.data;
  const fileProposalUrl = formData.get("fileProposalUrl");
  if (fileProposalUrl && typeof fileProposalUrl !== "string") {
    return { error: "Data PDF proposal tidak valid." };
  }
  const versiLama = proposal.versi_revisi;
  await dbAsUser(profile.id, async (tx) => {
    await tx.insert(proposalRevisions).values({
      proposal_id: proposal.id,
      versi: versiLama,
      snapshot: {
        judul_kegiatan: proposal.judul_kegiatan,
        divisi_pengaju: proposal.divisi_pengaju,
        deskripsi: proposal.deskripsi,
        tujuan_kegiatan: proposal.tujuan_kegiatan,
        tanggal_mulai: proposal.tanggal_mulai.toISOString().slice(0, 10),
        tanggal_selesai: proposal.tanggal_selesai.toISOString().slice(0, 10),
        lokasi: proposal.lokasi,
        anggaran_diajukan: proposal.anggaran_diajukan,
        status: proposal.status,
      },
      catatan: proposal.catatan_review ?? `Revisi permintaan LKPKA (versi ${versiLama + 1})`,
    });
    await tx
      .update(proposals)
      .set({
        judul_kegiatan: data.judul_kegiatan,
        divisi_pengaju: data.divisi_pengaju ?? null,
        deskripsi: data.deskripsi,
        tujuan_kegiatan: data.tujuan_kegiatan,
        tanggal_mulai: new Date(data.tanggal_mulai),
        tanggal_selesai: new Date(data.tanggal_selesai),
        lokasi: data.lokasi,
        anggaran_diajukan: String(data.anggaran_diajukan),
        file_proposal_url: fileProposalUrl,
        status: "diajukan",
        versi_revisi: versiLama + 1,
      })
      .where(eq(proposals.id, proposal.id));
    await logActivity(
      {
        actorId: profile.id,
        actorRole: "ormawa",
        action: "proposal.resubmit",
        targetTable: "proposals",
        targetId: proposal.id,
        metadata: { versi: versiLama + 1, judul: data.judul_kegiatan },
      },
      tx,
    );
  });

  return { ok: true, id: proposal.id };
}

export async function submitLpjAction(formData: FormData): Promise<ActionResult> {
  const proposalId = formData.get("proposalId");
  if (typeof proposalId !== "string" || !proposalId) {
    return { error: "Proposal tidak valid." };
  }
  const ringkasan = formData.get("ringkasan");
  let rincian: unknown;
  let files: unknown;
  try {
    rincian = JSON.parse(String(formData.get("rincian") ?? "[]"));
    files = JSON.parse(String(formData.get("files") ?? "[]"));
  } catch {
    return { error: "Data rincian tidak valid." };
  }

  const parsedRingkasan = z.string().trim().min(10, "Ringkasan penggunaan dana minimal 10 karakter.").safeParse(ringkasan);
  const parsedRincian = z.array(rincianPengeluaranSchema).min(1, "Minimal satu baris rincian pengeluaran.").safeParse(rincian);
  const parsedFiles = z.array(fileDokumentasiSchema).safeParse(files);
  if (!parsedRingkasan.success) return { error: parsedRingkasan.error.message };
  if (!parsedRincian.success) return { error: "Rincian pengeluaran tidak valid." };
  if (!parsedFiles.success) return { error: "Data dokumentasi tidak valid." };

  const guard = await guardOrmawa();
  if (!guard.ok) return { error: guard.error };
  const { profile } = guard;

  const nonaktif = await requireOrmawaAktif(profile.ormawa_id);
  if (nonaktif) return { error: nonaktif };

  const [proposal] = await db
    .select({
      id: proposals.id,
      ormawa_id: proposals.ormawa_id,
      status: proposals.status,
      tanggal_selesai: proposals.tanggal_selesai,
    })
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);
  if (!proposal || proposal.ormawa_id !== profile.ormawa_id) {
    return { error: "Proposal tidak ditemukan." };
  }
  if (!["kegiatan_berlangsung", "lpj_menunggu"].includes(proposal.status)) {
    return { error: "LPJ hanya bisa disubmit saat kegiatan berlangsung atau menunggu LPJ." };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (proposal.tanggal_selesai.getTime() > today.getTime()) {
    return { error: "LPJ hanya bisa disubmit setelah tanggal selesai kegiatan." };
  }

  const totalRealisasi = parsedRincian.data.reduce((acc, r) => acc + r.jumlah, 0);
  const fileLpjUrl = formData.get("fileLpjUrl");
  if (fileLpjUrl && typeof fileLpjUrl !== "string") {
    return { error: "Data PDF LPJ tidak valid." };
  }
  const fileLpj = typeof fileLpjUrl === "string" && fileLpjUrl ? fileLpjUrl : null;

  const [lpjLama] = await db
    .select({ id: lpj.id })
    .from(lpj)
    .where(eq(lpj.proposal_id, proposal.id))
    .limit(1);

  await dbAsUser(profile.id, async (tx) => {
    let lpjId: string;
    if (lpjLama) {
      await tx
        .update(lpj)
        .set({
          ringkasan_penggunaan_dana: parsedRingkasan.data,
          rincian_pengeluaran: parsedRincian.data,
          total_realisasi: String(totalRealisasi),
          file_lpj_url: fileLpj,
          status: "menunggu",
          catatan_review: null,
        })
        .where(eq(lpj.id, lpjLama.id));
      lpjId = lpjLama.id;
      await tx.delete(dokumentasiKegiatan).where(eq(dokumentasiKegiatan.lpj_id, lpjLama.id));
    } else {
      const [lpjRow] = await tx
        .insert(lpj)
        .values({
          proposal_id: proposal.id,
          ringkasan_penggunaan_dana: parsedRingkasan.data,
          rincian_pengeluaran: parsedRincian.data,
          total_realisasi: String(totalRealisasi),
          file_lpj_url: fileLpj,
          status: "menunggu",
        })
        .returning({ id: lpj.id });
      lpjId = lpjRow.id;
    }

    if (parsedFiles.data.length > 0) {
      await tx.insert(dokumentasiKegiatan).values(
        parsedFiles.data.map((f) => ({
          lpj_id: lpjId,
          file_url: f.url,
          file_type: f.file_type,
          caption: f.caption ?? null,
        })),
      );
    }

    await tx
      .update(proposals)
      .set({ status: "lpj_direview" })
      .where(eq(proposals.id, proposal.id));
    await logActivity(
      {
        actorId: profile.id,
        actorRole: "ormawa",
        action: lpjLama ? "lpj.resubmit" : "lpj.submit",
        targetTable: "lpj",
        targetId: lpjId,
        metadata: { totalRealisasi: String(totalRealisasi), jumlahFile: parsedFiles.data.length },
      },
      tx,
    );
  });

  return { ok: true, id: proposal.id };
}
