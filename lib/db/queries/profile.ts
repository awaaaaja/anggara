"use server";

import { z } from "zod";
import { sql } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { dbAsUser } from "@/lib/db/client";

const logoUrlSchema = z.object({
  logoUrl: z
    .string()
    .url("URL tidak valid")
    .refine(
      (url) =>
        url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logo/`),
      "URL harus dari bucket logo",
    ),
});

export async function updateProfileLogo(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sesi tidak valid. Silakan login ulang." };

  const parsed = logoUrlSchema.safeParse({ logoUrl: formData.get("logoUrl") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await dbAsUser(profile.id, async (tx) => {
      await tx.execute(sql`select public.update_own_logo(${parsed.data.logoUrl})`);
    });
  } catch {
    return { error: "Gagal menyimpan logo. Coba lagi." };
  }
  return { ok: true };
}
