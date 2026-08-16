"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_PROPOSAL_FILTER } from "@/lib/constants";

export function HistoryFilter({
  status,
  tahun,
  tahunOptions,
}: {
  status: string;
  tahun: string;
  tahunOptions: number[];
}) {
  const router = useRouter();

  function apply(nextStatus: string, nextTahun: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "semua") params.set("status", nextStatus);
    if (nextTahun) params.set("tahun", nextTahun);
    const qs = params.toString();
    router.push(qs ? `/ormawa/proposals?${qs}` : "/ormawa/proposals");
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="riwayat-status" className="text-xs text-muted-foreground">
          Status
        </Label>
        <Select value={status} onValueChange={(v) => apply(v, tahun)}>
          <SelectTrigger id="riwayat-status" className="w-full">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_PROPOSAL_FILTER.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="riwayat-tahun" className="text-xs text-muted-foreground">
          Tahun
        </Label>
        <Select value={tahun} onValueChange={(v) => apply(status, v)}>
          <SelectTrigger id="riwayat-tahun" className="w-full">
            <SelectValue placeholder="Semua tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua tahun</SelectItem>
            {tahunOptions.map((t) => (
              <SelectItem key={t} value={String(t)}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
