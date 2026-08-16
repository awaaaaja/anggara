import Link from "next/link";
import { notFound } from "next/navigation";
import { getLpjForReview } from "@/lib/db/queries/lkpka";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { LkpkaNav } from "@/components/shared/LkpkaNav";
import { LpjReviewActions } from "@/components/lpj/LpjReviewActions";
import { PdfPreviewDialog } from "@/components/shared/PdfPreviewDialog";
import { RUPIAH, STATUS_LPJ_LABEL, TANGGAL } from "@/lib/constants";
import type { StatusLpj } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function LkpkaLpjReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const data = await getLpjForReview(id, profile.id);
  if (!data || !data.lpj) notFound();

  const rincian = data.lpj.rincian_pengeluaran as Array<{
    item: string;
    jumlah: number;
    keterangan?: string;
  }>;
  const bisaReview = data.status === "lpj_direview";

  return (
    <div className="flex flex-col gap-6">
      <LkpkaNav active="lpj" />
      <div>
        <Link
          href="/lkpka/lpj"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke tracking LPJ
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{data.judul_kegiatan}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.ormawaNama} · {TANGGAL.format(new Date(data.tanggal_mulai))} —{" "}
          {TANGGAL.format(new Date(data.tanggal_selesai))} · {data.lokasi}
        </p>
        <p className="mt-1 text-sm">
          Status LPJ:{" "}
          <span className="font-medium">{STATUS_LPJ_LABEL[data.lpj.status as StatusLpj]}</span>
          {" · "}Nominal disetujui:{" "}
          <span className="font-medium">{RUPIAH.format(Number(data.anggaran))}</span>
          {" · "}Realisasi:{" "}
          <span className="font-medium">{RUPIAH.format(Number(data.lpj.total_realisasi))}</span>
        </p>
        {data.lpj.catatan_review && (
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-medium">Catatan review</p>
            <p className="mt-1">{data.lpj.catatan_review}</p>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Ringkasan penggunaan dana</h2>
        <p className="text-sm leading-relaxed">{data.lpj.ringkasan_penggunaan_dana}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Rincian pengeluaran</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {rincian.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3">{r.item}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {RUPIAH.format(Number(r.jumlah))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.keterangan ?? "—"}</td>
                </tr>
              ))}
              <tr className="bg-muted/50">
                <td className="px-4 py-3 font-medium">Total realisasi</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {RUPIAH.format(Number(data.lpj.total_realisasi))}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Dokumentasi kegiatan</h2>
        {data.lpj.dokumentasi.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada dokumentasi.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.lpj.dokumentasi.map((d) =>
              d.file_type === "foto" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={d.id}
                  src={d.file_url}
                  alt={d.caption ?? "Dokumentasi kegiatan"}
                  title={d.caption ?? undefined}
                  className="aspect-square w-full rounded-lg border object-cover"
                />
              ) : (
                <a
                  key={d.id}
                  href={d.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted text-center text-xs text-muted-foreground"
                >
                  {d.file_type === "video" ? "Video" : "Dokumen"}{" "}
                  {d.caption ? `· ${d.caption}` : ""}
                </a>
              ),
            )}
          </div>
        )}
        {data.lpj.file_lpj_url && (
          <div>
            <PdfPreviewDialog url={data.lpj.file_lpj_url} label="Buka PDF LPJ" />
          </div>
        )}
      </section>

      {bisaReview && profile.role === "lkpka" && (
        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="text-lg font-semibold tracking-tight">Putusan review LPJ</h2>
          <LpjReviewActions proposalId={data.id} />
        </section>
      )}
    </div>
  );
}
