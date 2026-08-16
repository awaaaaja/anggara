import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getOrmawaTahunOptions, listProposalsOrmawa } from "@/lib/db/queries/ormawa";
import { HistoryFilter } from "@/components/ormawa/HistoryFilter";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
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
import type { StatusProposal } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function OrmawaProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tahun?: string; page?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const { status, tahun, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const tahunOptions = await getOrmawaTahunOptions(profile.ormawa_id);
  const { rows, total, perPage } = await listProposalsOrmawa({
    ormawaId: profile.ormawa_id,
    status,
    tahun,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const makePageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (status && status !== "semua") params.set("status", status);
    if (tahun) params.set("tahun", tahun);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/ormawa/proposals?${qs}` : "/ormawa/proposals";
  };

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="proposal" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposal saya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} proposal ditemukan · {tahun || "semua tahun"}
          </p>
        </div>
        <Button asChild>
          <Link href="/ormawa/proposals/baru">Ajukan proposal</Link>
        </Button>
      </div>

      <HistoryFilter status={status ?? "semua"} tahun={tahun ?? ""} tahunOptions={tahunOptions} />

      {rows.length === 0 ? (
        <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
          Tidak ada proposal dengan filter ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Pelaksanaan</TableHead>
                <TableHead className="text-right">Anggaran diajukan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/ormawa/proposals/${p.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {p.judul_kegiatan}
                    </Link>
                    <p className="text-xs text-muted-foreground">Versi {p.versi_revisi + 1}</p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {TANGGAL.format(new Date(p.tanggal_mulai))} — {TANGGAL.format(new Date(p.tanggal_selesai))}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-sm">
                    {RUPIAH.format(Number(p.anggaran_diajukan))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status as StatusProposal} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={makePageUrl(page - 1)}>← Sebelumnya</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={makePageUrl(page + 1)}>Berikutnya →</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
