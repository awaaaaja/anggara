"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  proposalFormSchema,
  type ProposalFormValues,
} from "@/lib/validations/proposal";
import { createProposalAction, resubmitProposalAction } from "@/lib/db/queries/ormawa";
import { uploadPdfFile } from "@/lib/supabase/upload-pdf";

type Defaults = {
  proposalId?: string;
  judul_kegiatan: string;
  deskripsi: string;
  tujuan_kegiatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  anggaran_diajukan: string;
};

export function ProposalForm({ defaults, userId }: { defaults?: Defaults; userId: string }) {
  const router = useRouter();
  const isRevisi = !!defaults?.proposalId;
  const [serverError, setServerError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: defaults
      ? {
          judul_kegiatan: defaults.judul_kegiatan,
          deskripsi: defaults.deskripsi,
          tujuan_kegiatan: defaults.tujuan_kegiatan,
          tanggal_mulai: defaults.tanggal_mulai,
          tanggal_selesai: defaults.tanggal_selesai,
          lokasi: defaults.lokasi,
          anggaran_diajukan: Number(defaults.anggaran_diajukan),
        }
      : undefined,
  });

  async function onSubmit(values: ProposalFormValues, mode: "draft" | "ajukan") {
    setServerError(null);
    if (pdfFile && pdfFile.type !== "application/pdf") {
      setServerError("File harus berformat PDF.");
      return;
    }

    let uploadedPath: string | null = null;
    let pdfUrl: string | undefined;
    if (pdfFile) {
      try {
        const pdf = await uploadPdfFile(userId, "proposals", pdfFile);
        uploadedPath = pdf.path;
        pdfUrl = pdf.url;
      } catch (err) {
        setServerError(`Upload PDF gagal — ${err instanceof Error ? err.message : "kesalahan tidak diketahui"}`);
        return;
      }
    }

    const fd = new FormData();
    fd.set("judul_kegiatan", values.judul_kegiatan);
    fd.set("deskripsi", values.deskripsi);
    fd.set("tujuan_kegiatan", values.tujuan_kegiatan);
    fd.set("tanggal_mulai", values.tanggal_mulai);
    fd.set("tanggal_selesai", values.tanggal_selesai);
    fd.set("lokasi", values.lokasi);
    fd.set("anggaran_diajukan", String(values.anggaran_diajukan));
    fd.set("mode", mode);
    if (pdfUrl) fd.set("fileProposalUrl", pdfUrl);
    if (defaults?.proposalId) fd.set("proposalId", defaults.proposalId);

    const result = isRevisi
      ? await resubmitProposalAction(fd)
      : await createProposalAction(fd);
    if ("error" in result) {
      if (uploadedPath) {
        const { createClient } = await import("@/lib/supabase/client");
        await createClient().storage.from("dokumentasi-kegiatan").remove([uploadedPath]).catch(() => {});
      }
      setServerError(result.error);
      return;
    }    router.push(`/ormawa/proposals/${result.id}`);
    router.refresh();
  }

  const field = (name: keyof ProposalFormValues) =>
    register(name);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit((values) => onSubmit(values, "ajukan"))}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="judul_kegiatan">Judul kegiatan</Label>
        <Input
          id="judul_kegiatan"
          placeholder="Contoh: Pekan Olahraga Mahasiswa 2026"
          aria-invalid={!!errors.judul_kegiatan}
          {...field("judul_kegiatan")}
        />
        {errors.judul_kegiatan && <p className="text-xs text-destructive">{errors.judul_kegiatan.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="deskripsi">Deskripsi kegiatan</Label>
        <Textarea
          id="deskripsi"
          rows={4}
          placeholder="Apa kegiatan ini, seperti apa pelaksanaannya..."
          aria-invalid={!!errors.deskripsi}
          {...field("deskripsi")}
        />
        {errors.deskripsi && <p className="text-xs text-destructive">{errors.deskripsi.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tujuan_kegiatan">Tujuan kegiatan</Label>
        <Textarea
          id="tujuan_kegiatan"
          rows={3}
          placeholder="Manfaat atau hasil yang ingin dicapai..."
          aria-invalid={!!errors.tujuan_kegiatan}
          {...field("tujuan_kegiatan")}
        />
        {errors.tujuan_kegiatan && <p className="text-xs text-destructive">{errors.tujuan_kegiatan.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tanggal_mulai">Tanggal mulai</Label>
          <Input id="tanggal_mulai" type="date" aria-invalid={!!errors.tanggal_mulai} {...field("tanggal_mulai")} />
          {errors.tanggal_mulai && <p className="text-xs text-destructive">{errors.tanggal_mulai.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tanggal_selesai">Tanggal selesai</Label>
          <Input id="tanggal_selesai" type="date" aria-invalid={!!errors.tanggal_selesai} {...field("tanggal_selesai")} />
          {errors.tanggal_selesai && <p className="text-xs text-destructive">{errors.tanggal_selesai.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lokasi">Lokasi kegiatan</Label>
        <Input
          id="lokasi"
          placeholder="Contoh: Aula Universitas Adzkia"
          aria-invalid={!!errors.lokasi}
          {...field("lokasi")}
        />
        {errors.lokasi && <p className="text-xs text-destructive">{errors.lokasi.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="anggaran_diajukan">Anggaran diajukan (Rp)</Label>
        <Input
          id="anggaran_diajukan"
          type="number"
          min={1}
          step={1000}
          placeholder="4000000"
          aria-invalid={!!errors.anggaran_diajukan}
          {...field("anggaran_diajukan")}
        />
        {errors.anggaran_diajukan && <p className="text-xs text-destructive">{errors.anggaran_diajukan.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="file_proposal_pdf">PDF proposal (opsional)</Label>
        <Input
          id="file_proposal_pdf"
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
        />
        {pdfFile ? (
          <p className="text-xs text-muted-foreground">Terpilih: {pdfFile.name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isRevisi
              ? "Unggah ulang PDF revisi terbaru bila ada perubahan dokumen."
              : "Unggah PDF proposal bila diperlukan."}
          </p>
        )}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => onSubmit(values, "draft"))}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan draft"}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : isRevisi ? "Ajukan revisi" : "Ajukan ke LKPKA"}
        </Button>
      </div>
    </form>
  );
}
