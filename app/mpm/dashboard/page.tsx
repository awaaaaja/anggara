import { getMpmSummary } from "@/lib/db/queries/mpm";
import { applyAutoStatusTransitions } from "@/lib/db/queries/status-auto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RUPIAH, STATUS_PROPOSAL_LABEL } from "@/lib/constants";
import { MpmNav } from "@/components/shared/MpmNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnggaranChartSection } from "@/components/mpm/AnggaranChartSection";
import { CheckCircle2, FileText, Users, Wallet } from "lucide-react";

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
    { label: "Anggaran disetujui bulan ini", value: RUPIAH.format(summary.totalAnggaranBulanIni), icon: Wallet, tone: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300" },
    { label: "Total proposal", value: String(summary.totalProposal), icon: FileText, tone: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" },
    { label: "Ormawa aktif", value: String(summary.ormawaAktif), icon: Users, tone: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
    { label: "Kegiatan selesai", value: String(summary.perStatus.find((s) => s.status === "selesai")?.total ?? 0), icon: CheckCircle2, tone: "bg-gold/10 text-gold dark:bg-gold/15" },
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
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</p>
              </div>
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
            <AnggaranChartSection data={summary.perOrmawa} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Proposal per status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {summary.perStatus.length === 0 && (
              <EmptyState title="Belum ada proposal" description="Proposal pertama akan muncul di sini." className="py-8" />
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