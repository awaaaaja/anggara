import Link from "next/link";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RUPIAH, STATUS_LPJ_LABEL, STATUS_PROPOSAL_LABEL, TANGGAL } from "@/lib/constants";
import type { StatusLpj, StatusProposal } from "@/lib/db/schema";

type ArsipProposal = Awaited<ReturnType<typeof import("@/lib/db/queries/lkpka").listArsipProposals>>[number];
type ArsipLpj = Awaited<ReturnType<typeof import("@/lib/db/queries/lkpka").listArsipLpj>>[number];

function Section({
  title,
  count,
  filename,
  headers,
  rows,
  children,
}: {
  title: string;
  count: number;
  filename: string;
  headers: string[];
  rows: string[][];
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{count} arsip</p>
        </div>
        <ExportCsvButton filename={filename} headers={headers} rows={rows} />
      </div>
      {children}
    </section>
  );
}

export function ArsipView({
  proposals,
  lpj,
  proposalHref,
  lpjHref,
}: {
  proposals: ArsipProposal[];
  lpj: ArsipLpj[];
  proposalHref: (id: string) => string;
  lpjHref: (proposalId: string) => string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Arsip proposal"
        count={proposals.length}
        filename="arsip-proposal.csv"
        headers={[
          "Judul",
          "Ormawa",
          "Divisi",
          "Status",
          "Pelaksanaan",
          "Anggaran Diajukan",
          "Anggaran Disetujui",
          "Diajukan Pada",
        ]}
        rows={proposals.map((p) => [
          p.judul_kegiatan,
          p.ormawaNama,
          p.divisi_pengaju ?? "—",
          STATUS_PROPOSAL_LABEL[p.status],
          `${TANGGAL.format(new Date(p.tanggal_mulai))} — ${TANGGAL.format(new Date(p.tanggal_selesai))}`,
          RUPIAH.format(Number(p.anggaran_diajukan)),
          p.anggaran_disetujui ? RUPIAH.format(Number(p.anggaran_disetujui)) : "—",
          TANGGAL.format(new Date(p.created_at)),
        ].map(String))}
      >
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Ormawa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Anggaran disetujui</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada proposal.
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={proposalHref(p.id)} className="block hover:underline">
                        <span className="font-medium">{p.judul_kegiatan}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.divisi_pengaju ?? "Tanpa divisi"} ·{" "}
                          {TANGGAL.format(new Date(p.tanggal_mulai))}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{p.ormawaNama}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status as StatusProposal} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums">
                      {p.anggaran_disetujui ? RUPIAH.format(Number(p.anggaran_disetujui)) : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title="Arsip LPJ"
        count={lpj.length}
        filename="arsip-lpj.csv"
        headers={["Judul", "Ormawa", "Status LPJ", "Total Realisasi", "Dikirim"]}
        rows={lpj.map((l) => [
          l.judul,
          l.ormawaNama,
          STATUS_LPJ_LABEL[l.status],
          RUPIAH.format(Number(l.totalRealisasi)),
          TANGGAL.format(new Date(l.createdAt)),
        ].map(String))}
      >
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Ormawa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total realisasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lpj.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada LPJ.
                  </TableCell>
                </TableRow>
              ) : (
                lpj.map((l) => (
                  <TableRow key={l.proposalId}>
                    <TableCell>
                      <Link href={lpjHref(l.proposalId)} className="block hover:underline">
                        <span className="font-medium">{l.judul}</span>
                        <span className="block max-w-xs truncate text-xs text-muted-foreground">
                          {l.ringkasan}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{l.ormawaNama}</TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          l.status === "disetujui"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : l.status === "revisi_diminta"
                              ? "text-orange-700 dark:text-orange-400"
                              : "text-violet-700 dark:text-violet-400"
                        }`}
                      >
                        {STATUS_LPJ_LABEL[l.status as StatusLpj]}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums">
                      {RUPIAH.format(Number(l.totalRealisasi))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  );
}