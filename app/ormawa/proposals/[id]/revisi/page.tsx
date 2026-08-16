import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getProposalForOrmawa } from "@/lib/db/queries/ormawa";
import { ProposalForm } from "@/components/ormawa/ProposalForm";
import { OrmawaNav } from "@/components/shared/OrmawaNav";

export const dynamic = "force-dynamic";

export default async function RevisiProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const proposal = await getProposalForOrmawa(id, profile.ormawa_id);
  if (!proposal) notFound();
  if (proposal.status !== "revisi_diminta") redirect(`/ormawa/proposals/${id}`);

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="proposal" />
      <div>
        <Link
          href={`/ormawa/proposals/${id}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke detail
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Revisi proposal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perbaiki sesuai catatan LKPKA, lalu ajukan kembali.
        </p>
      </div>
      <ProposalForm
        defaults={{
          proposalId: proposal.id,
          judul_kegiatan: proposal.judul_kegiatan,
          deskripsi: proposal.deskripsi,
          tujuan_kegiatan: proposal.tujuan_kegiatan,
          tanggal_mulai: proposal.tanggal_mulai.toISOString().slice(0, 10),
          tanggal_selesai: proposal.tanggal_selesai.toISOString().slice(0, 10),
          lokasi: proposal.lokasi,
          anggaran_diajukan: proposal.anggaran_diajukan,
        }}
        userId={profile.id}
      />
    </div>
  );
}
