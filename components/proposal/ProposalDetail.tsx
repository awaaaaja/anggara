import { RUPIAH, TANGGAL } from "@/lib/constants";
import type { StatusProposal } from "@/lib/db/schema";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReviewActions } from "@/components/proposal/ReviewActions";
import { PdfPreviewDialog } from "@/components/shared/PdfPreviewDialog";

type ProposalDetailData = NonNullable<Awaited<ReturnType<typeof import("@/lib/db/queries/lkpka").getProposalForReview>>>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t py-4 first:border-t-0 first:pt-0 sm:grid sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export function ProposalDetail({
  proposal,
  readOnly = false,
}: {
  proposal: ProposalDetailData;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={proposal.status as StatusProposal} />
          <span className="text-xs text-muted-foreground">
            Versi {proposal.versi_revisi + 1} · Diajukan {TANGGAL.format(new Date(proposal.created_at))}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{proposal.judul_kegiatan}</h1>
        <p className="text-sm text-muted-foreground">
          {proposal.ormawaNama} · {proposal.ormawaJenis}
        </p>
        {proposal.catatan_review && (
          <div className="rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Catatan review
            </p>
            <p className="mt-1 text-sm">{proposal.catatan_review}</p>
          </div>
        )}
      </div>

      <dl>
        <Field label="Deskripsi kegiatan">{proposal.deskripsi}</Field>
        <Field label="Tujuan kegiatan">{proposal.tujuan_kegiatan}</Field>
        <Field label="Pelaksanaan">
          {TANGGAL.format(new Date(proposal.tanggal_mulai))} — {TANGGAL.format(new Date(proposal.tanggal_selesai))}
        </Field>
        <Field label="Lokasi">{proposal.lokasi}</Field>
        <Field label="Anggaran diajukan">{RUPIAH.format(Number(proposal.anggaran_diajukan))}</Field>
        <Field label="PDF proposal">
          {proposal.file_proposal_url ? (
            <PdfPreviewDialog url={proposal.file_proposal_url} label="Buka PDF proposal" />
          ) : (
            <span className="text-muted-foreground">PDF belum diunggah</span>
          )}
        </Field>
        {proposal.anggaran && (
          <>
            <Field label="Anggaran disetujui">
              <span className="font-semibold text-emerald-700">
                {RUPIAH.format(Number(proposal.anggaran.nominal_disetujui))}
              </span>
            </Field>
            <Field label="Catatan anggaran">
              {proposal.anggaran.catatan_anggaran ?? "—"}
            </Field>
            <Field label="Ditetapkan pada">
              {TANGGAL.format(new Date(proposal.anggaran.ditetapkan_pada))}
            </Field>
          </>
        )}
      </dl>

      {!readOnly && proposal.status === "diajukan" && (
        <div className="border-t pt-6">
          <p className="mb-3 text-sm font-medium">Putusan review</p>
          <ReviewActions proposalId={proposal.id} anggaranDiajukan={proposal.anggaran_diajukan} />
        </div>
      )}

      {proposal.revisions.length > 0 && (
        <div className="border-t pt-6">
          <p className="mb-3 text-sm font-medium">Riwayat revisi</p>
          <ol className="flex flex-col gap-4">
            {proposal.revisions.map((r) => (
              <li key={r.versi} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                    v{r.versi}
                  </span>
                  <span className="mt-1 h-full w-px bg-border" aria-hidden />
                </div>
                <div className="pb-2">
                  <p className="text-xs text-muted-foreground">
                    {TANGGAL.format(new Date(r.created_at))}
                  </p>
                  <p className="mt-0.5 text-sm">{r.catatan ?? "Revisi tanpa catatan"}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}