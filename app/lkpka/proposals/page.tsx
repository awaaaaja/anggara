import Link from "next/link";
import { listOrmawaOptions, listProposalsForReview } from "@/lib/db/queries/lkpka";
import { PdfPreviewDialog } from "@/components/shared/PdfPreviewDialog";
import { FilterBar } from "@/components/proposal/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LkpkaNav } from "@/components/shared/LkpkaNav";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RUPIAH, STATUS_PROPOSAL_LABEL, TANGGAL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function LkpkaProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ormawa?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "semua";
  const ormawaId = params.ormawa ?? "semua";
  const page = Math.max(1, Number(params.page) || 1);

  const [data, ormawaOptions] = await Promise.all([
    listProposalsForReview({ status, ormawaId, page }),
    listOrmawaOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.perPage));

  function pageUrl(nextPage: number) {
    const sp = new URLSearchParams();
    if (status !== "semua") sp.set("status", status);
    if (ormawaId !== "semua") sp.set("ormawa", ormawaId);
    sp.set("page", String(nextPage));
    return `/lkpka/proposals?${sp.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proposal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.total} proposal ditemukan · {STATUS_PROPOSAL_LABEL[status as keyof typeof STATUS_PROPOSAL_LABEL] ?? "Semua status"}
        </p>
      </div>

      <LkpkaNav active="proposal" />

      <FilterBar status={status} ormawaId={ormawaId} ormawaOptions={ormawaOptions} />

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kegiatan</TableHead>
                <TableHead>ORMAWA</TableHead>
                <TableHead>Anggaran diajukan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Tidak ada proposal dengan filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/lkpka/proposals/${p.id}/review`} className="block hover:underline">
                        <span className="font-medium">{p.judul_kegiatan}</span>
                        <span className="block text-xs text-muted-foreground">
                          {TANGGAL.format(new Date(p.tanggal_mulai))} — {TANGGAL.format(new Date(p.tanggal_selesai))}
                        </span>
                      </Link>
                      {p.file_proposal_url && (
                        <div className="mt-1">
                          <PdfPreviewDialog url={p.file_proposal_url} label="Lihat PDF" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{p.ormawaNama}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums">
                      {RUPIAH.format(Number(p.anggaran_diajukan))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {data.page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={pageUrl(page - 1)}>Sebelumnya</Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <Link href={pageUrl(page + 1)}>Berikutnya</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}