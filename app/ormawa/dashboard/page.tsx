import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Flag, RotateCcw, Activity, XCircle, CheckCircle2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getOrmawaSummary } from "@/lib/db/queries/ormawa";
import { applyAutoStatusTransitions } from "@/lib/db/queries/status-auto";
import { LogoUpload } from "@/components/shared/LogoUpload";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RUPIAH, TANGGAL } from "@/lib/constants";
import type { StatusProposal } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function OrmawaDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ormawa" || !profile.ormawa_id) redirect(`/${profile.role}/dashboard`);

  const summary = await applyAutoStatusTransitions().then(() =>
    getOrmawaSummary(profile.ormawa_id!, profile.id),
  );

  const stats = [
    {
      label: "Draft",
      value: summary.draft,
      href: "/ormawa/proposals?status=draft",
      icon: FileText,
      tone: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: "Menunggu review",
      value: summary.menungguReview,
      href: "/ormawa/proposals?status=diajukan",
      icon: Flag,
      tone: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Revisi diminta",
      value: summary.revisiDiminta,
      href: "/ormawa/proposals?status=revisi_diminta",
      icon: RotateCcw,
      tone: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Berjalan",
      value: summary.berjalan,
      href: "/ormawa/proposals?status=disetujui",
      icon: Activity,
      tone: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Ditolak",
      value: summary.ditolak,
      href: "/ormawa/proposals?status=ditolak",
      icon: XCircle,
      tone: "text-red-600 dark:text-red-400",
    },
    {
      label: "Selesai",
      value: summary.selesai,
      href: "/ormawa/proposals?status=selesai",
      icon: CheckCircle2,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="ringkasan" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Selamat datang, {profile.full_name}
            {profile.ormawaNama && (
              <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                {profile.ormawaNama}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Pantau proposal, revisi, dan LPJ organisasi Anda di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <LogoUpload
            userId={profile.id}
            logoUrl={profile.logo_url}
            displayName={profile.full_name}
          />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Total anggaran disetujui</p>
            <p className="text-xl font-bold tracking-tight">
              {RUPIAH.format(summary.totalAnggaranDisetujui)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition-colors hover:border-foreground/40">
              <CardContent className="flex flex-col gap-2 p-4">
                <s.icon className={`size-4 ${s.tone}`} />
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Kegiatan terbaru</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/ormawa/proposals/baru">Ajukan proposal</Link>
          </Button>
        </div>
        {summary.proposalTerkini.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Belum ada proposal"
            description="Ajukan kegiatan pertama organisasi Anda."
            action={
              <Button asChild size="sm">
                <Link href="/ormawa/proposals/baru">Ajukan proposal</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {summary.proposalTerkini.map((p) => (
              <Link
                key={p.id}
                href={`/ormawa/proposals/${p.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.judul_kegiatan}</p>
                  <p className="text-xs text-muted-foreground">
                    {TANGGAL.format(new Date(p.tanggal_mulai))} —{" "}
                    {TANGGAL.format(new Date(p.tanggal_selesai))}
                  </p>
                </div>
                <StatusBadge status={p.status as StatusProposal} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
