import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { notFound } from "next/navigation";
import { getProposalForReview } from "@/lib/db/queries/lkpka";
import { ProposalDetail } from "@/components/proposal/ProposalDetail";
import { LkpkaNav } from "@/components/shared/LkpkaNav";

export const dynamic = "force-dynamic";

export default async function LkpkaProposalReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const proposal = await getProposalForReview(id, profile?.id);
  if (!proposal) notFound();

  return (
    <div className="flex flex-col gap-6">
      <LkpkaNav active="proposal" />
      <div>
        <Link
          href="/lkpka/proposals"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke daftar
        </Link>
      </div>
      <ProposalDetail proposal={proposal} />
    </div>
  );
}
