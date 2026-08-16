import { and, asc, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  anggaran,
  dokumentasiKegiatan,
  lpj,
  ormawa,
  proposalRevisions,
  proposals,
  type StatusProposal,
} from "@/lib/db/schema";

export type ProposalStatusFilter = string;

export async function getLkpkaSummary() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [menungguReview] = await db
    .select({ total: count() })
    .from(proposals)
    .where(eq(proposals.status, "diajukan"));
  const [disetujuiBulanIni] = await db
    .select({ total: count() })
    .from(proposals)
    .where(and(eq(proposals.status, "disetujui"), gte(proposals.direview_pada, startOfMonth)));
  const [lpjMenunggu] = await db
    .select({ total: count() })
    .from(proposals)
    .where(inArray(proposals.status, ["lpj_menunggu", "lpj_direview"]));

  return {
    menungguReview: menungguReview?.total ?? 0,
    disetujuiBulanIni: disetujuiBulanIni?.total ?? 0,
    lpjMenunggu: lpjMenunggu?.total ?? 0,
  };
}

export async function listOrmawaOptions() {
  return db.select({ id: ormawa.id, nama: ormawa.nama }).from(ormawa).orderBy(asc(ormawa.nama));
}

export async function listProposalsForReview(opts: {
  status?: ProposalStatusFilter;
  ormawaId?: string;
  page: number;
  perPage?: number;
  dari?: string;
  sampai?: string;
}) {
  const perPage = opts.perPage ?? 20;
  const offset = (opts.page - 1) * perPage;
  const dariDate = opts.dari && opts.dari !== "semua" ? new Date(opts.dari + "T00:00:00") : null;
  const sampaiDate = opts.sampai && opts.sampai !== "semua" ? new Date(opts.sampai + "T23:59:59") : null;
  const conditions = [
    opts.status && opts.status !== "semua"
      ? eq(proposals.status, opts.status as StatusProposal)
      : undefined,
    opts.ormawaId && opts.ormawaId !== "semua" ? eq(proposals.ormawa_id, opts.ormawaId) : undefined,
    dariDate ? gte(proposals.created_at, dariDate) : undefined,
    sampaiDate ? lte(proposals.created_at, sampaiDate) : undefined,
  ].filter(Boolean) as Parameters<typeof and>[0][];

  const where = conditions.length ? and(...conditions) : undefined;
  const sort = opts.status === "diajukan" ? asc(proposals.created_at) : desc(proposals.created_at);

  const [{ total }] = await db.select({ total: count() }).from(proposals).where(where);
  const rows = await db
    .select({
      id: proposals.id,
      judul_kegiatan: proposals.judul_kegiatan,
      status: proposals.status,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
      anggaran_diajukan: proposals.anggaran_diajukan,
      created_at: proposals.created_at,
      ormawaNama: ormawa.nama,
    })
    .from(proposals)
    .leftJoin(ormawa, eq(proposals.ormawa_id, ormawa.id))
    .where(where)
    .orderBy(sort)
    .limit(perPage)
    .offset(offset);

  return { rows, total, page: opts.page, perPage };
}

export async function getProposalForReview(proposalId: string) {
  const [proposal] = await db
    .select({
      id: proposals.id,
      judul_kegiatan: proposals.judul_kegiatan,
      deskripsi: proposals.deskripsi,
      tujuan_kegiatan: proposals.tujuan_kegiatan,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
      lokasi: proposals.lokasi,
      anggaran_diajukan: proposals.anggaran_diajukan,
      file_proposal_url: proposals.file_proposal_url,
      status: proposals.status,
      versi_revisi: proposals.versi_revisi,
      catatan_review: proposals.catatan_review,
      direview_pada: proposals.direview_pada,
      created_at: proposals.created_at,
      ormawaNama: ormawa.nama,
      ormawaJenis: ormawa.jenis,
    })
    .from(proposals)
    .leftJoin(ormawa, eq(proposals.ormawa_id, ormawa.id))
    .where(eq(proposals.id, proposalId))
    .limit(1);
  if (!proposal) return null;

  const [anggaranRow] = await db
    .select({
      nominal_disetujui: anggaran.nominal_disetujui,
      catatan_anggaran: anggaran.catatan_anggaran,
      ditetapkan_pada: anggaran.ditetapkan_pada,
    })
    .from(anggaran)
    .where(eq(anggaran.proposal_id, proposalId))
    .limit(1);

  const revisions = await db
    .select({
      versi: proposalRevisions.versi,
      catatan: proposalRevisions.catatan,
      created_at: proposalRevisions.created_at,
    })
    .from(proposalRevisions)
    .where(eq(proposalRevisions.proposal_id, proposalId))
    .orderBy(desc(proposalRevisions.versi));

  return { ...proposal, anggaran: anggaranRow ?? null, revisions };
}

export async function listLpjTracking(opts: { page?: number; perPage?: number } = {}) {
  const perPage = opts.perPage ?? 20;
  const page = Math.max(1, opts.page ?? 1);
  const offset = (page - 1) * perPage;
  const trackingWhere = inArray(proposals.status, ["lpj_menunggu", "lpj_direview"]);

  const [{ total }] = await db
    .select({ total: count() })
    .from(proposals)
    .where(trackingWhere);

  const rows = await db
    .select({
      id: proposals.id,
      judul_kegiatan: proposals.judul_kegiatan,
      status: proposals.status,
      tanggal_selesai: proposals.tanggal_selesai,
      ormawaNama: ormawa.nama,
      lpjStatus: lpj.status,
      lpjUpdatedAt: lpj.updated_at,
    })
    .from(proposals)
    .leftJoin(ormawa, eq(proposals.ormawa_id, ormawa.id))
    .leftJoin(lpj, eq(lpj.proposal_id, proposals.id))
    .where(trackingWhere)
    .orderBy(asc(proposals.tanggal_selesai))
    .limit(perPage)
    .offset(offset);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    rows: rows.map((r) => ({
      ...r,
      terlambat: r.status === "lpj_menunggu" && r.tanggal_selesai.getTime() < today.getTime(),
    })),
    total,
    page,
    perPage,
  };
}

export async function getLpjForReview(proposalId: string) {
  const [proposal] = await db
    .select({
      id: proposals.id,
      judul_kegiatan: proposals.judul_kegiatan,
      status: proposals.status,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
      lokasi: proposals.lokasi,
      ormawaNama: ormawa.nama,
    })
    .from(proposals)
    .leftJoin(ormawa, eq(proposals.ormawa_id, ormawa.id))
    .where(eq(proposals.id, proposalId))
    .limit(1);
  if (!proposal) return null;

  const [lpjRow] = await db
    .select({
      id: lpj.id,
      ringkasan_penggunaan_dana: lpj.ringkasan_penggunaan_dana,
      rincian_pengeluaran: lpj.rincian_pengeluaran,
      total_realisasi: lpj.total_realisasi,
      file_lpj_url: lpj.file_lpj_url,
      status: lpj.status,
      catatan_review: lpj.catatan_review,
      direview_pada: lpj.direview_pada,
      created_at: lpj.created_at,
    })
    .from(lpj)
    .where(eq(lpj.proposal_id, proposalId))
    .limit(1);

  const [anggaranRow] = await db
    .select({ nominal_disetujui: anggaran.nominal_disetujui })
    .from(anggaran)
    .where(eq(anggaran.proposal_id, proposalId))
    .limit(1);

  const dokumentasi = lpjRow
    ? await db
        .select({
          id: dokumentasiKegiatan.id,
          file_url: dokumentasiKegiatan.file_url,
          file_type: dokumentasiKegiatan.file_type,
          caption: dokumentasiKegiatan.caption,
        })
        .from(dokumentasiKegiatan)
        .where(eq(dokumentasiKegiatan.lpj_id, lpjRow.id))
        .orderBy(asc(dokumentasiKegiatan.uploaded_at))
    : [];

  return {
    ...proposal,
    lpj: lpjRow ? { ...lpjRow, dokumentasi } : null,
    anggaran: anggaranRow?.nominal_disetujui ?? "0",
  };
}
