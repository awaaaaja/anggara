"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PdfPreviewDialog({ url, label = "Lihat PDF" }: { url: string; label?: string }) {
  const [open, setOpen] = useState(false);

  async function unduh() {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `dokumen-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <span>Dokumen PDF</span>
            <span className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={unduh}>
                Unduh
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  Buka di tab baru
                </a>
              </Button>
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pratinjau dokumen PDF. Klik Unduh untuk menyimpan berkas.
          </DialogDescription>
        </DialogHeader>
        <iframe
          src={url}
          title="Pratinjau PDF"
          className="h-[70vh] w-full rounded-lg border"
        />
      </DialogContent>
    </Dialog>
  );
}
