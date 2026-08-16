import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getProposalForOrmawa } from "@/lib/db/queries/ormawa";
import { ProposalDetail } from "@/components/proposal/ProposalDetail";
import { OrmawaNav } from "@/components/shared/OrmawaNav";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const proposal = await getProposalForOrmawa(id, profile.ormawa_id);
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
      </div>
    </div>
  );
}
