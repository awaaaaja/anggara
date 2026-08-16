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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveProposalAction,
  rejectProposalAction,
  requestRevisionAction,
} from "@/lib/db/queries/review";
import { RUPIAH } from "@/lib/constants";

const rejectSchema = z.object({
  alasan: z.string().trim().min(20, "Alasan penolakan minimal 20 karakter."),
});
const revisiSchema = z.object({
  catatan: z.string().trim().min(1, "Catatan revisi wajib diisi."),
});
const setujuiSchema = z.object({
  nominal: z.number("Nominal harus angka.").positive("Nominal harus lebih dari 0."),
  catatan: z.string().trim().optional(),
});

export function ReviewActions({
  proposalId,
  anggaranDiajukan,
}: {
  proposalId: string;
  anggaranDiajukan: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"tolak" | "revisi" | "setujui" | null>(null);

  const rejectForm = useForm<z.infer<typeof rejectSchema>>({ resolver: zodResolver(rejectSchema) });
  const revisiForm = useForm<z.infer<typeof revisiSchema>>({ resolver: zodResolver(revisiSchema) });
  const setujuiForm = useForm<z.infer<typeof setujuiSchema>>({
    resolver: zodResolver(setujuiSchema),
  });

  async function runAction(
    action: (fd: FormData) => Promise<{ ok: true } | { error: string }>,
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
      <Dialog open={dialog === "tolak"} onOpenChange={(open) => { setDialog(open ? "tolak" : null); setServerError(null); }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setDialog("tolak")}>
            Tolak
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak proposal</DialogTitle>
            <DialogDescription>
              Alasan penolakan akan terlihat oleh ORMAWA. Minimal 20 karakter.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={rejectForm.handleSubmit(async (values) => {
              const fd = new FormData();
              fd.append("proposalId", proposalId);
              fd.append("alasan", values.alasan);
              await runAction(rejectProposalAction, fd);
            })}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="alasan">Alasan penolakan</Label>
              <Textarea
                id="alasan"
                rows={4}
                placeholder="Contoh: anggaran konsumsi tidak sesuai ketentuan..."
                aria-invalid={!!rejectForm.formState.errors.alasan}
                {...rejectForm.register("alasan")}
              />
              {rejectForm.formState.errors.alasan && (
                <p className="text-xs text-destructive">{rejectForm.formState.errors.alasan.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={rejectForm.formState.isSubmitting} className="w-full sm:w-auto">
                {rejectForm.formState.isSubmitting ? "Menyimpan..." : "Tolak proposal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "revisi"} onOpenChange={(open) => { setDialog(open ? "revisi" : null); setServerError(null); }}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setDialog("revisi")}>
            Minta revisi
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minta revisi</DialogTitle>
            <DialogDescription>
              Catatan ini menjadi acuan ORMAWA memperbaiki proposal.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={revisiForm.handleSubmit(async (values) => {
              const fd = new FormData();
              fd.append("proposalId", proposalId);
              fd.append("catatan", values.catatan);
              await runAction(requestRevisionAction, fd);
            })}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="catatan-revisi">Catatan revisi</Label>
              <Textarea
                id="catatan-revisi"
                rows={4}
                placeholder="Sebutkan bagian yang perlu diperbaiki secara spesifik..."
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
          <Button onClick={() => setDialog("setujui")}>Setujui</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui & tetapkan anggaran</DialogTitle>
            <DialogDescription>
              Anggaran diajukan: {RUPIAH.format(Number(anggaranDiajukan))}. Nominal final boleh berbeda.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={setujuiForm.handleSubmit(async (values) => {
              const fd = new FormData();
              fd.append("proposalId", proposalId);
              fd.append("nominal", String(values.nominal));
              if (values.catatan) fd.append("catatan", values.catatan);
              await runAction(approveProposalAction, fd);
            })}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="nominal">Nominal anggaran disetujui (Rp)</Label>
              <Input
                id="nominal"
                type="number"
                min={1}
                step={1000}
                placeholder="4000000"
                aria-invalid={!!setujuiForm.formState.errors.nominal}
                {...setujuiForm.register("nominal", { valueAsNumber: true })}
              />
              {setujuiForm.formState.errors.nominal && (
                <p className="text-xs text-destructive">{setujuiForm.formState.errors.nominal.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="catatan-setujui">Catatan (opsional)</Label>
              <Textarea
                id="catatan-setujui"
                rows={3}
                placeholder="Contoh: nominal dikurangi untuk item konsumsi..."
                {...setujuiForm.register("catatan")}
              />
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={setujuiForm.formState.isSubmitting} className="w-full sm:w-auto">
                {setujuiForm.formState.isSubmitting ? "Menyimpan..." : "Setujui proposal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}