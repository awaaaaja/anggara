import Link from "next/link";
import { listLpjTracking } from "@/lib/db/queries/lkpka";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LkpkaNav } from "@/components/shared/LkpkaNav";
import { Button } from "@/components/ui/button";
import { TANGGAL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function LkpkaLpjPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { rows, total, page: currentPage, perPage } = await listLpjTracking({ page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const hariTerlambat = (tanggalSelesai: Date) => {
    const start = new Date(tanggalSelesai);
    start.setUTCHours(12, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    return Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tracking LPJ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Proposal disetujui yang wajib melapor. {rows.filter((r) => r.terlambat).length} terlambat.
        </p>
      </div>

      <LkpkaNav active="lpj" />

      <div className="flex flex-col divide-y rounded-xl border">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada proposal yang menunggu LPJ.
          </p>
        ) : (
          rows.map((r) => (
            <Link
              key={r.id}
              href={`/lkpka/lpj/${r.id}/review`}
              className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.judul_kegiatan}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.ormawaNama} · Jatuh tempo {TANGGAL.format(new Date(r.tanggal_selesai))}
                  {r.lpjStatus === "revisi_diminta" && <span className="ml-2">· LPJ sedang direvisi ormawa</span>}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={r.status} />
                {r.terlambat && (
                  <span className="text-xs font-medium text-red-700">
                    Terlambat {hariTerlambat(r.tanggal_selesai)} hari
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/lkpka/lpj?page=${currentPage - 1}`}>Sebelumnya</Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/lkpka/lpj?page=${currentPage + 1}`}>Berikutnya</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}