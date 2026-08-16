import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { db } from "@/lib/db/client";
import { ormawa } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProposalForm } from "@/components/ormawa/ProposalForm";
import { OrmawaNav } from "@/components/shared/OrmawaNav";

export const dynamic = "force-dynamic";

export default async function ProposalBaruPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ormawa" || !profile.ormawa_id) redirect("/login");

  const [row] = await db
    .select({ status: ormawa.status })
    .from(ormawa)
    .where(eq(ormawa.id, profile.ormawa_id))
    .limit(1);
  if (!row || row.status !== "aktif") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6">
        <p className="text-sm font-medium text-destructive">Organisasi berstatus nonaktif.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Anda tidak dapat mengajukan proposal baru. Hubungi MPM untuk mengaktifkan kembali organisasi Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OrmawaNav active="proposal" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proposal baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi data kegiatan, lalu simpan sebagai draft atau ajukan langsung ke LKPKA.
        </p>
      </div>
      <ProposalForm userId={profile.id} />
    </div>
  );
}
