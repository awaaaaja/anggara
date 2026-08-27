import { z } from "zod";

export const ormawaJenisOptions = [
  { value: "bem", label: "BEM" },
  { value: "hima", label: "HIMA" },
  { value: "ukm", label: "UKM" },
  { value: "lainnya", label: "Lainnya" },
];

export const ormawaStatusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

export const ormawaSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  jenis: z.enum(["bem", "hima", "ukm", "lainnya"], {
    errorMap: () => ({ message: "Pilih jenis ORMAWA" }),
  }),
  deskripsi: z.string().optional().default(""),
  status: z.enum(["aktif", "nonaktif"]),
});
