import { z } from "zod";

export const proposalFormSchema = z
  .object({
    judul_kegiatan: z
      .string()
      .trim()
      .min(3, "Judul kegiatan minimal 3 karakter.")
      .max(200, "Judul kegiatan maksimal 200 karakter."),
    divisi_pengaju: z.string().trim().max(100, "Divisi/Komisi/Kementerian maksimal 100 karakter.").optional(),
    deskripsi: z.string().trim().min(10, "Deskripsi kegiatan minimal 10 karakter."),
    tujuan_kegiatan: z.string().trim().min(10, "Tujuan kegiatan minimal 10 karakter."),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi."),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi."),
    lokasi: z.string().trim().min(3, "Lokasi kegiatan minimal 3 karakter."),
    anggaran_diajukan: z.coerce
      .number("Anggaran diajukan harus angka.")
      .positive("Anggaran diajukan harus lebih dari 0."),
  })
  .refine((data) => !data.tanggal_mulai || !data.tanggal_selesai || data.tanggal_selesai >= data.tanggal_mulai, {
    message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
    path: ["tanggal_selesai"],
  });

export type ProposalFormValues = z.input<typeof proposalFormSchema>;
