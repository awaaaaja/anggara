import { listOrmawaAdmin } from "@/lib/db/queries/mpm";
import Link from "next/link";
import { OrmawaFormDialog } from "@/components/mpm/OrmawaFormDialog";
import { OrmawaStatusToggle } from "@/components/mpm/OrmawaStatusToggle";
import { TabNav } from "@/components/shared/TabNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TANGGAL } from "@/lib/constants";

function StatusOrmawaBadge({ status }: { status: "aktif" | "nonaktif" }) {
  return (
    <Badge
      className={
        status === "aktif"
          ? "border-emerald-300 bg-emerald-50 font-medium text-emerald-800"
          : "border-red-300 bg-red-50 font-medium text-red-800"
      }
    >
      {status === "aktif" ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

export const dynamic = "force-dynamic";

export default async function MpmOrmawaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { rows: ormawaList, total, page: currentPage, perPage } = await listOrmawaAdmin({ page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ormawa</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} organisasi terdaftar</p>
        </div>
        <OrmawaFormDialog />
      </div>

      <TabNav
        items={[
          { href: "/mpm/dashboard", label: "Ringkasan" },
          { href: "/mpm/proposals", label: "Proposal" },
          { href: "/mpm/lpj", label: "LPJ" },
          { href: "/mpm/ormawa", label: "Ormawa", active: true },
          { href: "/mpm/activity-log", label: "Log aktivitas" },
        ]}
      />

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ormawaList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada ormawa terdaftar.
                </TableCell>
              </TableRow>
            )}
            {ormawaList.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <p className="font-medium">{o.nama}</p>
                  <p className="max-w-md truncate text-xs text-muted-foreground">{o.deskripsi}</p>
                </TableCell>
                <TableCell className="text-sm capitalize">{o.jenis}</TableCell>
                <TableCell>
                  <StatusOrmawaBadge status={o.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{TANGGAL.format(new Date(o.created_at))}</TableCell>
                <TableCell className="text-right">
                  <OrmawaStatusToggle ormawaId={o.id} status={o.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/mpm/ormawa?page=${currentPage - 1}`}>Sebelumnya</Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/mpm/ormawa?page=${currentPage + 1}`}>Berikutnya</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
