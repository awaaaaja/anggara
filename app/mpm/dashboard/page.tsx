import { getMpmSummary } from "@/lib/db/queries/mpm";
import { applyAutoStatusTransitions } from "@/lib/db/queries/status-auto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RUPIAH, STATUS_PROPOSAL_LABEL } from "@/lib/constants";
import nextDynamic from "next/dynamic";
import { MpmNav } from "@/components/shared/MpmNav";

const AnggaranPerOrmawaChart = nextDynamic(
  () => import("@/components/mpm/AnggaranPerOrmawaChart").then((m) => m.AnggaranPerOrmawaChart),
  { ssr: false },
);

const STATUS_COLOR: Record<string, string> = {
  draft: "text-zinc-600 dark:text-zinc-400",
  diajukan: "text-amber-700 dark:text-amber-400",
  revisi_diminta: "text-orange-700 dark:text-orange-400",
  ditolak: "text-red-700 dark:text-red-400",
  disetujui: "text-emerald-700 dark:text-emerald-400",
  kegiatan_berlangsung: "text-sky-700 dark:text-sky-400",
  lpj_menunggu: "text-violet-700 dark:text-violet-400",
  lpj_direview: "text-blue-700 dark:text-blue-400",
  selesai: "text-green-700 dark:text-green-400",
};

export const dynamic = "force-dynamic";

export default async function MpmDashboardPage() {
  const summary = await applyAutoStatusTransitions().then(() => getMpmSummary());

  const stats = [
    { label: "Anggaran disetujui bulan ini", value: RUPIAH.format(summary.totalAnggaranBulanIni) },
    { label: "Total proposal", value: String(summary.totalProposal) },
    { label: "Ormawa aktif", value: String(summary.ormawaAktif) },
    { label: "Kegiatan selesai", value: String(summary.perStatus.find((s) => s.status === "selesai")?.total ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ringkasan pengawasan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Posisi terakhir seluruh kegiatan ormawa.</p>
      </div>

      <MpmNav active="ringkasan" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Anggaran disetujui per ormawa</CardTitle>
          </CardHeader>
          <CardContent>
            <AnggaranPerOrmawaChart data={summary.perOrmawa} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Proposal per status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {summary.perStatus.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada proposal.</p>
            )}
            {summary.perStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">{STATUS_PROPOSAL_LABEL[s.status]}</span>
                <span className={`text-sm font-semibold ${STATUS_COLOR[s.status]}`}>
                  {s.total}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}