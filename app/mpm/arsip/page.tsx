import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { listArsipLpj, listArsipProposals } from "@/lib/db/queries/lkpka";
import { MpmNav } from "@/components/shared/MpmNav";
import { ArsipView } from "@/components/shared/ArsipView";

export const dynamic = "force-dynamic";

export default async function MpmArsipPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "mpm") redirect("/login");

  const [proposals, lpj] = await Promise.all([
    listArsipProposals(profile?.id),
    listArsipLpj(profile?.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <MpmNav active="arsip" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Arsip</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seluruh proposal dan LPJ, dapat diekspor ke CSV.
        </p>
      </div>
      <ArsipView
        proposals={proposals}
        lpj={lpj}
        proposalHref={(id) => `/mpm/proposals/${id}`}
        lpjHref={(proposalId) => `/mpm/proposals/${proposalId}`}
      />
    </div>
  );
}
