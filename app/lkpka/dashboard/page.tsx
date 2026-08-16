import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileCheck2, Hourglass } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getLkpkaSummary, listProposalsForReview } from "@/lib/db/queries/lkpka";
import { applyAutoStatusTransitions } from "@/lib/db/queries/status-auto";
import { LogoUpload } from "@/components/shared/LogoUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LkpkaNav } from "@/components/shared/LkpkaNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TANGGAL } from "@/lib/constants";

export default async function LkpkaDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [summary, antrian] = await Promise.all([
    applyAutoStatusTransitions().then(() => getLkpkaSummary()),
    listProposalsForReview({ status: "diajukan", page: 1, perPage: 5 }),
  ]);

  const stats = [
    { label: "Menunggu review", value: summary.menungguReview, href: "/lkpka/proposals?status=diajukan", icon: Hourglass, tone: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" },
    { label: "Disetujui bulan ini", value: summary.disetujuiBulanIni, href: "/lkpka/proposals?status=disetujui", icon: FileCheck2, tone: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
    { label: "LPJ menunggu", value: summary.lpjMenunggu, href: "/lkpka/lpj", icon: ClipboardCheck, tone: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard LKPKA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selamat datang, {profile.full_name}
        </p>
      </div>

      <LkpkaNav active="ringkasan" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex items-center gap-4 rounded-xl border p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] active:scale-[0.98]"
          >
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</p>
              <p className="truncate text-sm text-muted-foreground">{s.label}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Antrian review</CardTitle>
          <CardDescription>Proposal paling lama menunggu tampil pertama.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {antrian.rows.length === 0 ? (
            <EmptyState title="Tidak ada proposal menunggu review" description="Antrian kosong — semua sudah ditangani." className="py-8" />
          ) : (
            antrian.rows.map((p) => (
              <Link
                key={p.id}
                href={`/lkpka/proposals/${p.id}/review`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60 active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.judul_kegiatan}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.ormawaNama} · {TANGGAL.format(new Date(p.tanggal_mulai))}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload userId={profile.id} logoUrl={profile.logo_url} displayName={profile.full_name} />
        </CardContent>
      </Card>
    </div>
  );
}