import Link from "next/link";
import { listLpjGallery } from "@/lib/db/queries/mpm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RUPIAH } from "@/lib/constants";
import { PdfPreviewDialog } from "@/components/shared/PdfPreviewDialog";
import { MpmNav } from "@/components/shared/MpmNav";

export const dynamic = "force-dynamic";

export default async function MpmLpjPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { rows: gallery, total, page: currentPage, perPage } = await listLpjGallery({ page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LPJ Kegiatan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} LPJ terkirim · galeri pengawasan read-only
        </p>
      </div>

      <MpmNav active="lpj" />

      {gallery.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada LPJ yang dikirim ormawa.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {gallery.map((g) => {
          const rincian = Array.isArray(g.rincian) ? g.rincian : [];
          const selisih = Number(g.totalRealisasi) - Number(g.nominalDisetujui ?? 0);
          return (
            <Card key={g.proposalId}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{g.judul}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{g.ormawaNama}</p>
                </div>
                <StatusBadge status={g.status} />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{g.ringkasan}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">Disetujui</p>
                    <p className="font-semibold">{RUPIAH.format(Number(g.nominalDisetujui ?? 0))}</p>
                  </div>
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">Realisasi</p>
                    <p className="font-semibold">{RUPIAH.format(Number(g.totalRealisasi))}</p>
                  </div>
                </div>
                <p className={`text-xs ${selisih >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  {selisih >= 0 ? "Sisa" : "Selisih kurang"}: {RUPIAH.format(Math.abs(selisih))}
                </p>

                {rincian.length > 0 && (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Item</th>
                          <th className="px-3 py-2 text-left font-medium">Jumlah</th>
                          <th className="px-3 py-2 text-left font-medium">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rincian.map((r: { item?: string; jumlah?: string | number; keterangan?: string }, i: number) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{r.item}</td>
                            <td className="px-3 py-2">{RUPIAH.format(Number(r.jumlah ?? 0))}</td>
                            <td className="px-3 py-2 text-muted-foreground">{r.keterangan ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {g.fileLpjUrl && (
                  <PdfPreviewDialog url={g.fileLpjUrl} label="Buka PDF LPJ" />
                )}

                {g.dokumentasi.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Dokumentasi ({g.dokumentasi.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.dokumentasi
                        .filter((d) => d.fileType === "foto")
                        .map((d) => (
                          <a key={d.fileUrl} href={d.fileUrl} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={d.fileUrl}
                              alt={d.caption ?? "Dokumentasi kegiatan"}
                              className="aspect-video w-full rounded-lg border object-cover"
                            />
                          </a>
                        ))}
                    </div>
                    {g.dokumentasi.some((d) => d.fileType === "video") && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {g.dokumentasi.filter((d) => d.fileType === "video").length} video terlampir
                      </p>
                    )}
                  </div>
                )}

                <Button asChild variant="outline" size="sm" className="self-start">
                  <Link href={`/mpm/proposals/${g.proposalId}`}>Lihat proposal asal</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/mpm/lpj?page=${currentPage - 1}`}>Sebelumnya</Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/mpm/lpj?page=${currentPage + 1}`}>Berikutnya</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}