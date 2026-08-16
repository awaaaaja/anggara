import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { listAllProposals } from "@/lib/db/queries/mpm";
import { listOrmawaOptions } from "@/lib/db/queries/lkpka";
import { PdfPreviewDialog } from "@/components/shared/PdfPreviewDialog";
import { FilterBar } from "@/components/proposal/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RUPIAH, TANGGAL } from "@/lib/constants";
import { MpmNav } from "@/components/shared/MpmNav";

export const dynamic = "force-dynamic";

export default async function MpmProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    ormawa?: string;
    dari?: string;
    sampai?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const status = params.status ?? "semua";
  const ormawaId = params.ormawa ?? "semua";
  const dari = params.dari ?? "semua";
  const sampai = params.sampai ?? "semua";
  const page = Math.max(1, Number(params.page) || 1);

  const [data, ormawaOptions] = await Promise.all([
    listAllProposals({ status, ormawaId, dari, sampai, page }),
    listOrmawaOptions(profile?.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.perPage));

  function pageUrl(nextPage: number) {
    const sp = new URLSearchParams();
    if (status !== "semua") sp.set("status", status);
    if (ormawaId !== "semua") sp.set("ormawa", ormawaId);
    if (dari !== "semua") sp.set("dari", dari);
    if (sampai !== "semua") sp.set("sampai", sampai);
    sp.set("page", String(nextPage));
    return `/mpm/proposals?${sp.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proposal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.total} proposal ditemukan · tampilan pengawasan read-only
        </p>
      </div>

      <MpmNav active="proposal" />

      <FilterBar
        basePath="/mpm/proposals"
        status={status}
        ormawaId={ormawaId}
        ormawaOptions={ormawaOptions}
        dari={dari}
        sampai={sampai}
        showTanggal
      />

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kegiatan</TableHead>
              <TableHead>Ormawa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Anggaran diajukan</TableHead>
              <TableHead>Diajukan</TableHead>
              <TableHead className="text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada proposal yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
            {data.rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-xs">
                  <p className="truncate font-medium">{p.judul_kegiatan}</p>
                  <p className="text-xs text-muted-foreground">
                    {TANGGAL.format(new Date(p.tanggal_mulai))} —{" "}
                    {TANGGAL.format(new Date(p.tanggal_selesai))}
                  </p>
                  {p.file_proposal_url && (
                    <div className="mt-1">
                      <PdfPreviewDialog url={p.file_proposal_url} label="Lihat PDF" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">{p.ormawaNama}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-right text-sm">
                  {RUPIAH.format(Number(p.anggaran_diajukan))}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {TANGGAL.format(new Date(p.created_at))}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/mpm/proposals/${p.id}`}>Lihat</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {data.page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={pageUrl(data.page - 1)}>Sebelumnya</Link>
              </Button>
            )}
            {data.page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={pageUrl(data.page + 1)}>Berikutnya</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
