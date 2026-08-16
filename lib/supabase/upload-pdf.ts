import { createClient } from "@/lib/supabase/client";

export async function uploadPdfFile(
  userId: string,
  folder: string,
  file: File,
): Promise<{ path: string; url: string }> {
  const path = `${userId}/${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("dokumentasi-kegiatan").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return { path, url: supabase.storage.from("dokumentasi-kegiatan").getPublicUrl(path).data.publicUrl };
}
