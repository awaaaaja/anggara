import { z } from "zod";

export const createOrmawaSchema = z.object({
  nama: z.string().min(3, "Nama ormawa minimal 3 karakter.").max(100, "Nama ormawa maksimal 100 karakter."),
  jenis: z.enum(["bem", "hima", "ukm", "lainnya"], { message: "Pilih jenis ormawa." }),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter.").max(500, "Deskripsi maksimal 500 karakter."),
  email: z.string().email("Format email tidak valid.").max(254, "Email terlalu panjang."),
  password: z.string().min(8, "Password sementara minimal 8 karakter.").max(72, "Password maksimal 72 karakter."),
});

export type CreateOrmawaInput = z.infer<typeof createOrmawaSchema>;
