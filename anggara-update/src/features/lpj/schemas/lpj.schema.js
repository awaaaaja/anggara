import { z } from "zod";

export const lpjRejectSchema = z.object({
  catatan: z.string().min(1, "Catatan wajib diisi"),
});
