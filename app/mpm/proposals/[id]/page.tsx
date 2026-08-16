import Link from "next/link";
import { notFound } from "next/navigation";
import { getProposalForReviewMpm } from "@/lib/db/queries/mpm";
import { ProposalDetail } from "@/components/proposal/ProposalDetail";
import { TabNav } from "@/components/shared/TabNav";
import { Button } from "@/components/ui/button";

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
      <TabNav
        items={[
          { href: "/mpm/dashboard", label: "Ringkasan" },
          { href: "/mpm/proposals", label: "Proposal", active: true },
          { href: "/mpm/lpj", label: "LPJ" },
          { href: "/mpm/ormawa", label: "Ormawa" },
          { href: "/mpm/activity-log", label: "Log aktivitas" },
        ]}
      />
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/mpm/proposals">← Kembali ke daftar</Link>
        </Button>
      </div>
      <ProposalDetail proposal={proposal} readOnly />
    </div>
  );
}
