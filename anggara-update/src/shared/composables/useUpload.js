import { ref, watch, toValue } from "vue";
import { uploadFile, getSignedUrl, validateFile, BUCKETS } from "@/services/storage.service";

// Upload helper with loading/error state. Validation (type + size) is enforced
// inside storage.service.uploadFile before any bytes leave the client.
export function useUpload(opts = {}) {
  const uploading = ref(false);
  const error = ref(null);
  const progress = ref(0);

  async function upload({ bucket, path, file }) {
    error.value = null;
    uploading.value = true;
    progress.value = 0;
    try {
      const p = await uploadFile({
        bucket,
        path,
        file,
        allowedTypes: opts.allowedTypes,
        maxSizeBytes: opts.maxSizeBytes,
      });
      progress.value = 100;
      return p;
    } catch (e) {
      error.value = e?.message || "Gagal mengunggah berkas";
      throw e;
    } finally {
      uploading.value = false;
    }
  }

  return { upload, uploading, error, progress, BUCKETS, validateFile };
}

// Reactive signed URL for a private-bucket object. Accepts a ref or getter.
export function useSignedUrl(bucket, source, expiresIn = 3600) {
  const url = ref(null);
  const loading = ref(false);

  async function resolve() {
    const path = toValue(source);
    if (!path) {
      url.value = null;
      return;
    }
    loading.value = true;
    try {
      url.value = await getSignedUrl(bucket, path, expiresIn);
    } catch {
      url.value = null;
    } finally {
      loading.value = false;
    }
  }

  watch(() => toValue(source), resolve, { immediate: true });
  return { url, loading };
}
