import { z } from "zod";

export const rincianPengeluaranSchema = z.object({
  item: z.string().trim().min(2, "Nama item minimal 2 karakter."),
  jumlah: z.coerce.number("Jumlah harus angka.").positive("Jumlah harus lebih dari 0."),
  keterangan: z.string().trim().optional(),
});

export const lpjFormSchema = z.object({
  ringkasan_penggunaan_dana: z
    .string()
    .trim()
    .min(10, "Ringkasan penggunaan dana minimal 10 karakter."),
  rincian_pengeluaran: z
    .array(rincianPengeluaranSchema)
    .min(1, "Minimal satu baris rincian pengeluaran."),
});

export const fileDokumentasiSchema = z.object({
  url: z.string().url("URL file tidak valid."),
  file_type: z.enum(["foto", "video", "dokumen"], "Jenis file tidak valid."),
  caption: z.string().trim().max(200, "Caption maksimal 200 karakter.").optional(),
});

export type LpjFormValues = z.input<typeof lpjFormSchema>;
export type FileDokumentasi = z.infer<typeof fileDokumentasiSchema>;
