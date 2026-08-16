import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { db } from "@/lib/db/client";
import { anggaran, dokumentasiKegiatan, lpj, proposals } from "@/lib/db/schema";
import { LpjForm } from "@/components/ormawa/LpjForm";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RUPIAH, STATUS_LPJ_LABEL, TANGGAL } from "@/lib/constants";
import type { StatusLpj, StatusProposal } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function LpjPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const [proposal] = await db
    .select({
      id: proposals.id,
      ormawa_id: proposals.ormawa_id,
      judul_kegiatan: proposals.judul_kegiatan,
      status: proposals.status,
      tanggal_mulai: proposals.tanggal_mulai,
      tanggal_selesai: proposals.tanggal_selesai,
    })
    .from(proposals)
    .where(eq(proposals.id, id))
    .limit(1);
  if (!proposal || proposal.ormawa_id !== profile.ormawa_id) notFound();

  const [anggaranRow] = await db
    .select({ nominal_disetujui: anggaran.nominal_disetujui })
    .from(anggaran)
    .where(eq(anggaran.proposal_id, id))
    .limit(1);

  const [lpjRow] = await db
    .select({
      id: lpj.id,
      ringkasan_penggunaan_dana: lpj.ringkasan_penggunaan_dana,
      rincian_pengeluaran: lpj.rincian_pengeluaran,
      file_lpj_url: lpj.file_lpj_url,
      status: lpj.status,
      catatan_review: lpj.catatan_review,
    })
    .from(lpj)
    .where(eq(lpj.proposal_id, id))
    .limit(1);

  const dokumentasiLama = lpjRow
    ? await db
        .select({
          file_url: dokumentasiKegiatan.file_url,
          file_type: dokumentasiKegiatan.file_type,
          caption: dokumentasiKegiatan.caption,
        })
        .from(dokumentasiKegiatan)
        .where(eq(dokumentasiKegiatan.lpj_id, lpjRow.id))
    : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selesaiTerlewat = proposal.tanggal_selesai.getTime() <= today.getTime();
  const modeEdit = lpjRow?.status === "revisi_diminta" && proposal.status === "lpj_menunggu";
  const bisaSubmit = ["kegiatan_berlangsung", "lpj_menunggu"].includes(proposal.status);

  if (!bisaSubmit) {
    redirect(`/ormawa/proposals/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="proposal" />
      <div>
        <Link
          href={`/ormawa/proposals/${id}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke detail
        </Link>
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={proposal.status as StatusProposal} />
            {lpjRow && (
              <span className="text-xs text-muted-foreground">
                LPJ: {STATUS_LPJ_LABEL[lpjRow.status as StatusLpj]}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {modeEdit ? "Perbaiki LPJ" : "Submit LPJ"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {proposal.judul_kegiatan} · {TANGGAL.format(new Date(proposal.tanggal_mulai))} —{" "}
            {TANGGAL.format(new Date(proposal.tanggal_selesai))}
          </p>
          <p className="text-sm text-muted-foreground">
            Nominal disetujui:{" "}
            <span className="font-semibold text-foreground">
              {RUPIAH.format(Number(anggaranRow?.nominal_disetujui ?? 0))}
            </span>
          </p>
        </div>
      </div>

      {modeEdit && lpjRow?.catatan_review && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Catatan review LPJ</p>
          <p className="mt-1">{lpjRow.catatan_review}</p>
        </div>
      )}

      {dokumentasiLama.length > 0 && modeEdit && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Dokumentasi sebelumnya</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {dokumentasiLama.map((d, i) =>
              d.file_type === "foto" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={d.file_url}
                  alt={d.caption ?? "Dokumentasi lama"}
                  className="aspect-square w-full rounded-lg border object-cover"
                />
              ) : (
                <a
                  key={i}
                  href={d.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted text-center text-xs text-muted-foreground"
                >
                  {d.file_type === "video" ? "Video" : "Dokumen"}
                </a>
              ),
            )}
          </div>
        </div>
      )}

      {!selesaiTerlewat && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          LPJ dapat disubmit setelah tanggal selesai kegiatan (
          {TANGGAL.format(new Date(proposal.tanggal_selesai))}).
        </div>
      )}

      <LpjForm
        proposalId={proposal.id}
        userId={profile.id}
        nominalDisetujui={anggaranRow?.nominal_disetujui ?? "0"}
        initial={
          lpjRow
            ? {
                ringkasan: lpjRow.ringkasan_penggunaan_dana,
                rincian:
                  (lpjRow.rincian_pengeluaran as Array<{
                    item: string;
                    jumlah: number;
                    keterangan?: string;
                  }>) ?? [],
                pdfUrl: lpjRow.file_lpj_url,
              }
            : undefined
        }
      />
    </div>
  );
}
