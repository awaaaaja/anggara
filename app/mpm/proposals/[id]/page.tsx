import Link from "next/link";
import { notFound } from "next/navigation";
import { getProposalForReviewMpm } from "@/lib/db/queries/mpm";
import { ProposalDetail } from "@/components/proposal/ProposalDetail";
import { Button } from "@/components/ui/button";
import { MpmNav } from "@/components/shared/MpmNav";

export const dynamic = "force-dynamic";

export default async function MpmProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposalForReviewMpm(id);
  if (!proposal) notFound();

  return (
    <div className="flex flex-col gap-6">
      <MpmNav active="proposal" />
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/mpm/proposals">← Kembali ke daftar</Link>
        </Button>
      </div>
      <ProposalDetail proposal={proposal} readOnly />
    </div>
  );
}