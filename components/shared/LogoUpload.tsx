"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateProfileLogo } from "@/lib/db/queries/profile";

export function LogoUpload({ userId, logoUrl, displayName }: { userId: string; logoUrl: string | null; displayName: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran maksimal 2 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${userId}/logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("logo").upload(path, file, { upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from("logo").getPublicUrl(path);
      const logoForm = new FormData();
      logoForm.append("logoUrl", urlData.publicUrl);
      const res = await updateProfileLogo(logoForm);
      if (!res.ok) throw new Error(res.error ?? "Gagal menyimpan logo.");

      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-20 w-20 border border-border">
        <AvatarImage src={logoUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Label htmlFor="logo-upload" className="sr-only">
          Upload logo
        </Label>
        <Input
          id="logo-upload"
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" />
          {uploading ? "Mengunggah..." : "Ubah logo"}
        </Button>
        {error && <p className="text-center text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}