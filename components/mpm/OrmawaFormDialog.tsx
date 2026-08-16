"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrmawaSchema, type CreateOrmawaInput } from "@/lib/validations/mpm";
import { createOrmawaAction } from "@/lib/db/queries/mpm";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrmawaFormDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrmawaInput>({
    resolver: zodResolver(createOrmawaSchema),
    defaultValues: { nama: "", jenis: "ukm", deskripsi: "", email: "", password: "" },
  });
  const jenis = watch("jenis");

  async function onSubmit(values: CreateOrmawaInput) {
    setServerError(null);
    const result = await createOrmawaAction(values);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambahkan ormawa</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambahkan ormawa baru</DialogTitle>
          <DialogDescription>
            Akun login akan dibuat otomatis dan langsung bisa dipakai oleh pengurus ormawa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ormawa-nama">Nama ormawa</Label>
            <Input id="ormawa-nama" {...register("nama")} placeholder="mis. UKM Robotika Adzkia" />
            {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ormawa-jenis">Jenis ormawa</Label>
            <Select value={jenis} onValueChange={(v) => setValue("jenis", v as CreateOrmawaInput["jenis"], { shouldValidate: true })}>
              <SelectTrigger id="ormawa-jenis">
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bem">BEM</SelectItem>
                <SelectItem value="hima">HIMA</SelectItem>
                <SelectItem value="ukm">UKM</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            {errors.jenis && <p className="text-xs text-destructive">{errors.jenis.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ormawa-deskripsi">Deskripsi</Label>
            <Textarea id="ormawa-deskripsi" {...register("deskripsi")} placeholder="Deskripsi singkat organisasi" />
            {errors.deskripsi && <p className="text-xs text-destructive">{errors.deskripsi.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ormawa-email">Email login</Label>
            <Input id="ormawa-email" type="email" {...register("email")} placeholder="ormawa@anggara.test" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ormawa-password">Password sementara</Label>
            <Input id="ormawa-password" type="text" {...register("password")} placeholder="minimal 8 karakter" />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {serverError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
