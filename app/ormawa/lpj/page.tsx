import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { listLpjOrmawa } from "@/lib/db/queries/ormawa";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { Button } from "@/components/ui/button";
import { RUPIAH, STATUS_LPJ_LABEL, TANGGAL } from "@/lib/constants";
import type { StatusLpj, StatusProposal } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const LPJ_BADGE: Record<StatusLpj, string> = {
  menunggu: "text-violet-700 dark:text-violet-400",
  disetujui: "text-emerald-700 dark:text-emerald-400",
  revisi_diminta: "text-orange-700 dark:text-orange-400",
};

export default async function OrmawaLpjPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const rows = await listLpjOrmawa(profile.ormawa_id, profile.id);
  const denganLpj = rows.filter((r) => r.lpjStatus);

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="lpj" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LPJ Kegiatan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {denganLpj.length} LPJ dikirim dari {rows.length} kegiatan
          </p>
        </div>
        <ExportCsvButton
          filename="lpj-ormawa.csv"
          headers={["Judul", "Pelaksanaan", "Status LPJ", "Total Realisasi", "Diajukan"]}
          rows={rows.map((r) => [
            r.judul,
            `${TANGGAL.format(new Date(r.tanggalMulai))} — ${TANGGAL.format(new Date(r.tanggalSelesai))}`,
            r.lpjStatus ? STATUS_LPJ_LABEL[r.lpjStatus] : "Belum dikirim",
            r.totalRealisasi ? RUPIAH.format(Number(r.totalRealisasi)) : "—",
            TANGGAL.format(new Date(r.createdAt)),
          ])}
        />
      </div>

      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada kegiatan. Ajukan proposal terlebih dahulu.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((r) => {
          const bisaSubmit = ["kegiatan_berlangsung", "lpj_menunggu"].includes(r.status);
          const perbaiki = r.lpjStatus === "revisi_diminta" && r.status === "lpj_menunggu";
          return (
            <div
              key={r.proposalId}
              className="flex flex-col gap-3 rounded-xl border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/ormawa/proposals/${r.proposalId}`}
                    className="font-medium hover:underline"
                  >
                    {r.judul}
                  </Link>
                  <StatusBadge status={r.status as StatusProposal} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {TANGGAL.format(new Date(r.tanggalMulai))} —{" "}
                  {TANGGAL.format(new Date(r.tanggalSelesai))}
                </p>
                <p className="text-xs">
                  LPJ:{" "}
                  <span className={LPJ_BADGE[r.lpjStatus as StatusLpj] ?? "text-muted-foreground"}>
                    {r.lpjStatus ? STATUS_LPJ_LABEL[r.lpjStatus] : "Belum dikirim"}
                  </span>
                  {r.totalRealisasi && (
                    <span className="text-muted-foreground">
                      {" "}
                      · Realisasi {RUPIAH.format(Number(r.totalRealisasi))}
                    </span>
                  )}
                </p>
                {perbaiki && r.lpjCatatan && (
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    Catatan: {r.lpjCatatan}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {bisaSubmit && (
                  <Button asChild size="sm">
                    <Link href={`/ormawa/lpj/${r.proposalId}`}>
                      {perbaiki ? "Perbaiki LPJ" : "Isi LPJ"}
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/ormawa/proposals/${r.proposalId}`}>Lihat detail</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
