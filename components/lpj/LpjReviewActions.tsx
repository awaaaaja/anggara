"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mintaRevisiLpjAction, setujuiLpjAction } from "@/lib/db/queries/lpj-review";

const revisiSchema = z.object({
  catatan: z.string().trim().min(10, "Catatan revisi minimal 10 karakter."),
});

export function LpjReviewActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"revisi" | "setujui" | null>(null);

  const revisiForm = useForm<z.infer<typeof revisiSchema>>({
    resolver: zodResolver(revisiSchema),
  });

  async function runAction(
    action: (fd: FormData) => Promise<{ ok: boolean } | { error: string }>,
    formData: FormData,
  ) {
    setServerError(null);
    const result = await action(formData);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    setDialog(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Dialog open={dialog === "revisi"} onOpenChange={(open) => { setDialog(open ? "revisi" : null); setServerError(null); }}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setDialog("revisi")}>
            Minta revisi LPJ
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minta revisi LPJ</DialogTitle>
            <DialogDescription>
              Proposal kembali ke status Menunggu LPJ hingga ORMAWA memperbaiki laporan.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={revisiForm.handleSubmit(async (values) => {
              const fd = new FormData();
              fd.append("proposalId", proposalId);
              fd.append("catatan", values.catatan);
              await runAction(mintaRevisiLpjAction, fd);
            })}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="catatan-revisi-lpj">Catatan revisi</Label>
              <Textarea
                id="catatan-revisi-lpj"
                rows={4}
                placeholder="Sebutkan bagian LPJ yang perlu diperbaiki secara spesifik..."
                aria-invalid={!!revisiForm.formState.errors.catatan}
                {...revisiForm.register("catatan")}
              />
              {revisiForm.formState.errors.catatan && (
                <p className="text-xs text-destructive">{revisiForm.formState.errors.catatan.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={revisiForm.formState.isSubmitting} className="w-full sm:w-auto">
                {revisiForm.formState.isSubmitting ? "Menyimpan..." : "Kirim permintaan revisi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "setujui"} onOpenChange={(open) => { setDialog(open ? "setujui" : null); setServerError(null); }}>
        <DialogTrigger asChild>
          <Button onClick={() => setDialog("setujui")}>Setujui LPJ</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui LPJ</DialogTitle>
            <DialogDescription>
              Proposal akan ditutup dengan status Selesai. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <DialogFooter>
            <Button
              type="button"
              onClick={async () => {
                const fd = new FormData();
                fd.append("proposalId", proposalId);
                await runAction(setujuiLpjAction, fd);
              }}
              className="w-full sm:w-auto"
            >
              Konfirmasi setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
