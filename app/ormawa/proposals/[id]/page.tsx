import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getProposalForOrmawa, getProposalTimeline } from "@/lib/db/queries/ormawa";
import { ProposalDetail } from "@/components/proposal/ProposalDetail";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { Button } from "@/components/ui/button";
import { ACTION_LABEL, TANGGAL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const [proposal, timeline] = await Promise.all([
    getProposalForOrmawa(id, profile.ormawa_id),
    getProposalTimeline(id, profile.ormawa_id),
  ]);
  if (!proposal) notFound();

  const bisaLpj = ["kegiatan_berlangsung", "lpj_menunggu"].includes(proposal.status);

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="proposal" />
      <div>
        <Link
          href="/ormawa/proposals"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke daftar
        </Link>
        <ProposalDetail proposal={proposal} readOnly />
        {(proposal.status === "revisi_diminta" || bisaLpj) && (
          <div className="mt-6 flex flex-col gap-2 border-t pt-6 sm:flex-row">
            {proposal.status === "revisi_diminta" && (
              <Button asChild>
                <Link href={`/ormawa/proposals/${proposal.id}/revisi`}>Revisi proposal</Link>
              </Button>
            )}
            {bisaLpj && (
              <Button asChild variant="outline">
                <Link href={`/ormawa/lpj/${proposal.id}`}>Submit LPJ</Link>
              </Button>
            )}
          </div>
        )}

        {timeline.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Riwayat pengajuan</p>
              <ExportCsvButton
                filename={`riwayat-${proposal.id}.csv`}
                label="Ekspor riwayat"
                headers={["Waktu", "Aksi", "Pelaku"]}
                rows={timeline.map((t) => [
                  TANGGAL.format(new Date(t.waktu)),
                  ACTION_LABEL[t.action] ?? t.action,
                  t.actorRole,
                ])}
              />
            </div>
            <ol className="flex flex-col gap-3">
              {timeline.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                    {i < timeline.length - 1 && <span className="h-full w-px bg-border" aria-hidden />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm">{ACTION_LABEL[t.action] ?? t.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {TANGGAL.format(new Date(t.waktu))} · {t.actorRole}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}