import { z } from "zod";

export const proposalFormSchema = z.object({
  judul_kegiatan: z.string().min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  tujuan_kegiatan: z.string().min(10, "Tujuan minimal 10 karakter"),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  lokasi: z.string().min(3, "Lokasi wajib diisi"),
  anggaran_diajukan: z.coerce
    .number({ invalid_type_error: "Anggaran harus angka" })
    .positive("Anggaran harus lebih dari 0"),
});
