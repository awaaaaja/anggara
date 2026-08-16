import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { listArsipLpj, listArsipProposals } from "@/lib/db/queries/lkpka";
import { LkpkaNav } from "@/components/shared/LkpkaNav";
import { ArsipView } from "@/components/shared/ArsipView";

export const dynamic = "force-dynamic";

export default async function LkpkaArsipPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "lkpka") redirect("/login");

  const [proposals, lpj] = await Promise.all([
    listArsipProposals(profile?.id),
    listArsipLpj(profile?.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <LkpkaNav active="arsip" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Arsip</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seluruh proposal dan LPJ, dapat diekspor ke CSV.
        </p>
      </div>
      <ArsipView
        proposals={proposals}
        lpj={lpj}
        proposalHref={(id) => `/lkpka/proposals/${id}/review`}
        lpjHref={(proposalId) => `/lkpka/lpj/${proposalId}/review`}
      />
    </div>
  );
}
