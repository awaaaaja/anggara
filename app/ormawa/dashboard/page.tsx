import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getOrmawaSummary } from "@/lib/db/queries/ormawa";
import { applyAutoStatusTransitions } from "@/lib/db/queries/status-auto";
import { LogoUpload } from "@/components/shared/LogoUpload";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RUPIAH, TANGGAL } from "@/lib/constants";
import type { StatusProposal } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function OrmawaDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ormawa" || !profile.ormawa_id) redirect(`/${profile.role}/dashboard`);

  const summary = await applyAutoStatusTransitions().then(() => getOrmawaSummary(profile.ormawa_id!));

  const stats = [
    { label: "Draft", value: summary.draft, href: "/ormawa/proposals?status=draft" },
    { label: "Menunggu review", value: summary.menungguReview, href: "/ormawa/proposals?status=diajukan" },
    { label: "Revisi diminta", value: summary.revisiDiminta, href: "/ormawa/proposals?status=revisi_diminta" },
    { label: "Berjalan", value: summary.berjalan, href: "/ormawa/proposals?status=disetujui" },
    { label: "Ditolak", value: summary.ditolak, href: "/ormawa/proposals?status=ditolak" },
    { label: "Selesai", value: summary.selesai, href: "/ormawa/proposals?status=selesai" },
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
          <CardDescription>Pantau proposal, revisi, dan LPJ organisasi Anda di sini.</CardDescription>
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
              <CardContent className="p-4">
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
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
          <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
            Belum ada proposal. Ajukan kegiatan pertama Anda.
          </div>
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
                    {TANGGAL.format(new Date(p.tanggal_mulai))} — {TANGGAL.format(new Date(p.tanggal_selesai))}
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
