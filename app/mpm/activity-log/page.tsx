import Link from "next/link";
import { listActivityActors, listActivityLogs } from "@/lib/db/queries/mpm";
import { TabNav } from "@/components/shared/TabNav";
import { Button } from "@/components/ui/button";
import { ActivityLogFilters } from "@/components/mpm/ActivityLogFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TANGGAL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "proposal.submit": "Mengajukan proposal",
  "proposal.resubmit": "Mengajukan revisi proposal",
  "proposal.approve": "Menyetujui proposal",
  "proposal.reject": "Menolak proposal",
  "proposal.revisi_diminta": "Meminta revisi",
  "proposal.auto_mulai": "Kegiatan otomatis berlangsung",
  "proposal.auto_lpj_menunggu": "Otomatis menunggu LPJ",
  "lpj.submit": "Mengirim LPJ",
  "lpj.resubmit": "Mengirim ulang LPJ",
  "lpj.approve": "Menyetujui LPJ",
  "lpj.revisi_diminta": "Meminta revisi LPJ",
  "ormawa.created": "Membuat ormawa",
  "ormawa.status_changed": "Mengubah status ormawa",
};

export default async function MpmActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; action?: string; page?: string }>;
}) {
  const params = await searchParams;
  const role = params.role ?? "semua";
  const action = params.action ?? "semua";
  const page = Math.max(1, Number(params.page) || 1);

  const [data, filters] = await Promise.all([
    listActivityLogs({ actorRole: role, action, page }),
    listActivityActors(),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.perPage));

  function pageUrl(nextPage: number, nextRole = role, nextAction = action) {
    const sp = new URLSearchParams();
    if (nextRole !== "semua") sp.set("role", nextRole);
    if (nextAction !== "semua") sp.set("action", nextAction);
    sp.set("page", String(nextPage));
    return `/mpm/activity-log?${sp.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log aktivitas</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.total} peristiwa tercatat</p>
      </div>

      <TabNav
        items={[
          { href: "/mpm/dashboard", label: "Ringkasan" },
          { href: "/mpm/proposals", label: "Proposal" },
          { href: "/mpm/lpj", label: "LPJ" },
          { href: "/mpm/ormawa", label: "Ormawa" },
          { href: "/mpm/activity-log", label: "Log aktivitas", active: true },
        ]}
      />

      <ActivityLogFilters
        role={role}
        action={action}
        roles={filters.roles}
        actions={filters.actions}
        basePath="/mpm/activity-log"
        actionLabels={ACTION_LABEL}
      />

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Aktor</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada aktivitas tercatat.
                </TableCell>
              </TableRow>
            )}
            {data.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {TANGGAL.format(new Date(row.createdAt))}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{ACTION_LABEL[row.action] ?? row.action}</p>
                  <p className="text-xs text-muted-foreground">{row.action}</p>
                </TableCell>
                <TableCell className="text-sm">
                  <p>{row.actorNama ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{row.actorRole.toUpperCase()}</p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.targetTable}
                  {(row.metadata as { email?: string } | null)?.email ? ` · ${(row.metadata as { email?: string } | null)?.email}` : ""}
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
