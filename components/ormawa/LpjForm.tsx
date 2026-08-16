"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Film, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RUPIAH } from "@/lib/constants";
import { submitLpjAction } from "@/lib/db/queries/ormawa";
import { lpjFormSchema, type LpjFormValues } from "@/lib/validations/lpj";
import { createClient } from "@/lib/supabase/client";
import { uploadPdfFile } from "@/lib/supabase/upload-pdf";

const supabase = createClient();

type PickedFile = {
  id: string;
  file: File;
  preview: string;
  file_type: "foto" | "video" | "dokumen";
  caption: string;
};

function typeFromMime(mime: string): PickedFile["file_type"] {
  if (mime.startsWith("image/")) return "foto";
  if (mime.startsWith("video/")) return "video";
  return "dokumen";
}

export function LpjForm({
  proposalId,
  userId,
  nominalDisetujui,
  initial,
}: {
  proposalId: string;
  userId: string;
  nominalDisetujui: string;
  initial?: {
    ringkasan?: string;
    rincian?: Array<{ item: string; jumlah: number; keterangan?: string }>;
    pdfUrl?: string | null;
  };
}) {
  const router = useRouter();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pickKey, setPickKey] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfKey, setPdfKey] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LpjFormValues>({
    resolver: zodResolver(lpjFormSchema),
    defaultValues: {
      ringkasan_penggunaan_dana: initial?.ringkasan ?? "",
      rincian_pengeluaran: initial?.rincian?.length
        ? initial.rincian
        : [{ item: "", jumlah: 0, keterangan: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "rincian_pengeluaran" });
  const rincian = useWatch({ control, name: "rincian_pengeluaran" });
  const totalRealisasi = useMemo(
    () => (rincian ?? []).reduce((acc, r) => acc + (Number(r.jumlah) || 0), 0),
    [rincian],
  );

  function pickFiles(list: FileList | null) {
    if (!list) return;
    const next: PickedFile[] = Array.from(list).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      preview: URL.createObjectURL(f),
      file_type: typeFromMime(f.type),
      caption: "",
    }));
    setFiles((prev) => [...prev, ...next]);
    setPickKey((k) => k + 1);
  }

  function updateCaption(id: string, caption: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, caption } : f)));
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function onSubmit(values: LpjFormValues) {
    setServerError(null);
    if (files.length === 0) {
      setServerError("Minimal satu file dokumentasi kegiatan wajib diunggah.");
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    let lpjPdfPath: string | null = null;
    let uploadPdfResult: { path: string; url: string } | null = null;
    try {
      if (pdfFile) {
        uploadPdfResult = await uploadPdfFile(userId, "lpj", pdfFile);
        lpjPdfPath = uploadPdfResult.path;
      }
      for (const f of files) {
        const path = `${userId}/${proposalId}/${Date.now()}-${f.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from("dokumentasi-kegiatan").upload(path, f.file, {
          upsert: false,
        });
        if (error) {
          throw new Error(`${f.file.name}: ${error.message}`);
        }
        uploaded.push(path);
      }
    } catch (err) {
      for (const path of uploaded) {
        await supabase.storage.from("dokumentasi-kegiatan").remove([path]);
      }
      if (lpjPdfPath) {
        await supabase.storage.from("dokumentasi-kegiatan").remove([lpjPdfPath]);
      }
      setUploading(false);
      setServerError(err instanceof Error ? `Upload gagal — ${err.message}` : "Upload dokumentasi gagal.");
      return;
    }

    const publicUrls = files.map((f, i) => ({
      url: supabase.storage.from("dokumentasi-kegiatan").getPublicUrl(uploaded[i]).data.publicUrl,
      file_type: f.file_type,
      caption: f.caption || undefined,
    }));

    const fd = new FormData();
    fd.set("proposalId", proposalId);
    fd.set("ringkasan", values.ringkasan_penggunaan_dana);
    fd.set("rincian", JSON.stringify(values.rincian_pengeluaran));
    fd.set("files", JSON.stringify(publicUrls));
    fd.set("fileLpjUrl", uploadPdfResult?.url ?? initial?.pdfUrl ?? "");

    const result = await submitLpjAction(fd);
    setUploading(false);
    if ("error" in result) {
      await supabase.storage.from("dokumentasi-kegiatan").remove([lpjPdfPath ?? ""]).catch(() => {});
      setServerError(result.error);
      return;
    }
    router.push(`/ormawa/proposals/${proposalId}`);
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ringkasan">Ringkasan penggunaan dana</Label>
        <Textarea
          id="ringkasan"
          rows={4}
          placeholder="Jelaskan secara ringkas bagaimana dana yang disetujui digunakan..."
          aria-invalid={!!errors.ringkasan_penggunaan_dana}
          {...register("ringkasan_penggunaan_dana")}
        />
        {errors.ringkasan_penggunaan_dana && (
          <p className="text-xs text-destructive">{errors.ringkasan_penggunaan_dana.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Rincian pengeluaran</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ item: "", jumlah: 0, keterangan: "" })}
          >
            <Plus className="size-4" /> Tambah baris
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Nominal disetujui: {RUPIAH.format(Number(nominalDisetujui))}
        </p>

        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-start"
            >
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Nama item"
                  aria-invalid={!!errors.rincian_pengeluaran?.[index]?.item}
                  {...register(`rincian_pengeluaran.${index}.item`)}
                />
                {errors.rincian_pengeluaran?.[index]?.item && (
                  <p className="text-xs text-destructive">{errors.rincian_pengeluaran?.[index]?.item.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  min={1}
                  step={1000}
                  placeholder="Jumlah (Rp)"
                  aria-invalid={!!errors.rincian_pengeluaran?.[index]?.jumlah}
                  {...register(`rincian_pengeluaran.${index}.jumlah`, { valueAsNumber: true })}
                />
                {errors.rincian_pengeluaran?.[index]?.jumlah && (
                  <p className="text-xs text-destructive">{errors.rincian_pengeluaran?.[index]?.jumlah.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Keterangan (opsional)"
                  {...register(`rincian_pengeluaran.${index}.keterangan`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Hapus baris ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors.rincian_pengeluaran && (
          <p className="text-xs text-destructive">{errors.rincian_pengeluaran.message}</p>
        )}

        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <p className="text-sm">
            Total realisasi:{" "}
            <span className="font-semibold">{RUPIAH.format(totalRealisasi)}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium">Dokumentasi kegiatan</Label>
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors hover:bg-muted/40"
          htmlFor="file-dokumentasi"
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">Pilih foto/video/dokumen</span>
          <span className="text-xs text-muted-foreground">Boleh lebih dari satu file</span>
          <input
            id="file-dokumentasi"
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
            className="sr-only"
            key={pickKey}
            onChange={(e) => pickFiles(e.target.files)}
          />
        </label>

        {files.length > 0 && (
          <div className="flex flex-col gap-3">
            {files.map((f) => (
              <div key={f.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {f.file_type === "foto" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.preview} alt={f.file.name} className="size-full object-cover" />
                  ) : f.file_type === "video" ? (
                    <Film className="size-6 text-muted-foreground" />
                  ) : (
                    <FileText className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="truncate text-sm font-medium">{f.file.name}</p>
                  <Input
                    placeholder="Caption (opsional)"
                    value={f.caption}
                    onChange={(e) => updateCaption(f.id, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Hapus ${f.file.name}`}
                  onClick={() => removeFile(f.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="file_lpj_pdf">PDF LPJ {initial ? "(biarkan kosong untuk memakai PDF lama)" : "(opsional)"}</Label>
        <Input
          id="file_lpj_pdf"
          key={pdfKey}
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setPdfFile(e.target.files?.[0] ?? null);
            setPdfKey((k) => k + 1);
          }}
        />
        {pdfFile ? (
          <p className="text-xs text-muted-foreground">Terpilih: {pdfFile.name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {initial?.pdfUrl ? "PDF lama akan tetap dipakai." : "Unggah dokumen LPJ resmi dalam format PDF."}
          </p>
        )}
      </div>

      {initial && (
        <p className="text-xs text-muted-foreground">
          Dokumentasi lama akan diganti seluruhnya dengan unggahan baru di bawah ini.
        </p>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={isSubmitting || uploading} className="w-full sm:w-auto">
          {isSubmitting || uploading ? "Mengirim..." : initial ? "Kirim perbaikan LPJ" : "Submit LPJ"}
        </Button>
      </div>
    </form>
  );
}
