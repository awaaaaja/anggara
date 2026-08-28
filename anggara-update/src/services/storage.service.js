import { supabase } from "@/services/supabase";

export const BUCKETS = {
  PROPOSAL_DOKUMEN: "proposal-dokumen",
  DOKUMENTASI: "dokumentasi-kegiatan",
  LOGO: "logo",
};

// Stored file_url may be a full public URL (legacy seed) or a raw storage path.
// Normalise to a storage path so we can mint signed URLs for private buckets.
export function toStoragePath(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) {
    const marker = "/object/public/";
    const i = fileUrl.indexOf(marker);
    return i >= 0 ? fileUrl.slice(i + marker.length) : fileUrl;
  }
  return fileUrl;
}

export function validateFile(file, allowedTypes = [], maxSizeBytes = 5 * 1024 * 1024) {
  if (!file) throw new Error("Tidak ada berkas yang dipilih");
  if (allowedTypes.length && !allowedTypes.includes(file.type)) {
    throw new Error(`Tipe berkas tidak diizinkan. Hanya: ${allowedTypes.join(", ")}`);
  }
  if (file.size > maxSizeBytes) {
    const mb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    throw new Error(`Ukuran berkas maksimal ${mb} MB`);
  }
  return true;
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const p = toStoragePath(path);
  if (!p) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(p, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

// Uploads to a PRIVATE bucket. Ownership/path is decided by the caller (service
// layer) and enforced by storage RLS. Caller must pass an allowedTypes/maxSize
// contract; validation runs client-side as a fast guard before the network call.
export async function uploadFile({
  bucket,
  path,
  file,
  allowedTypes = [],
  maxSizeBytes = 5 * 1024 * 1024,
}) {
  validateFile(file, allowedTypes, maxSizeBytes);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return data.path;
}

export async function removeFile(bucket, path) {
  const p = toStoragePath(path);
  if (!p) return;
  const { error } = await supabase.storage.from(bucket).remove([p]);
  if (error) throw error;
}
