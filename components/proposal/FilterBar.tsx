"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { STATUS_PROPOSAL_FILTER } from "@/lib/constants";

export function FilterBar({
  status,
  ormawaId,
  ormawaOptions,
  basePath = "/lkpka/proposals",
  dari = "semua",
  sampai = "semua",
  showTanggal = false,
}: {
  status: string;
  ormawaId: string;
  ormawaOptions: Array<{ id: string; nama: string }>;
  basePath?: string;
  dari?: string;
  sampai?: string;
  showTanggal?: boolean;
}) {
  const router = useRouter();

  function apply(nextStatus: string, nextOrmawa: string, nextDari?: string, nextSampai?: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "semua") params.set("status", nextStatus);
    if (nextOrmawa !== "semua") params.set("ormawa", nextOrmawa);
    if (nextDari && nextDari !== "semua") params.set("dari", nextDari);
    if (nextSampai && nextSampai !== "semua") params.set("sampai", nextSampai);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
          Status
        </Label>
        <Select value={status} onValueChange={(v) => apply(v, ormawaId, dari, sampai)}>
          <SelectTrigger id="filter-status" className="w-full">
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
        <Label htmlFor="filter-ormawa" className="text-xs text-muted-foreground">
          Ormawa
        </Label>
        <Select value={ormawaId} onValueChange={(v) => apply(status, v, dari, sampai)}>
          <SelectTrigger id="filter-ormawa" className="w-full">
            <SelectValue placeholder="Pilih ormawa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua ormawa</SelectItem>
            {ormawaOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showTanggal && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-dari" className="text-xs text-muted-foreground">
              Diajukan dari
            </Label>
            <Input
              id="filter-dari"
              type="date"
              defaultValue={dari === "semua" ? "" : dari}
              onChange={(e) => apply(status, ormawaId, e.target.value || "semua", sampai)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-sampai" className="text-xs text-muted-foreground">
              Sampai
            </Label>
            <Input
              id="filter-sampai"
              type="date"
              defaultValue={sampai === "semua" ? "" : sampai}
              onChange={(e) => apply(status, ormawaId, dari, e.target.value || "semua")}
            />
          </div>
        </>
      )}
    </div>
  );
}
