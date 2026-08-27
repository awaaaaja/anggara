import { z } from "zod";

// Approve needs an approved budget figure; reject/revision need a note.
export const approveSchema = z.object({
  nominal_disetujui: z.coerce
    .number({ invalid_type_error: "Nominal harus angka" })
    .positive("Nominal harus lebih dari 0"),
  catatan: z.string().optional(),
});

export const reviewNoteSchema = z.object({
  catatan: z.string().min(1, "Catatan wajib diisi"),
});
