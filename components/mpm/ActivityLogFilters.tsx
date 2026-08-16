"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ActivityLogFilters({
  role,
  action,
  roles,
  actions,
  basePath,
  actionLabels,
}: {
  role: string;
  action: string;
  roles: string[];
  actions: string[];
  basePath: string;
  actionLabels: Record<string, string>;
}) {
  function hrefFor(nextRole: string, nextAction: string) {
    const params = new URLSearchParams();
    if (nextRole !== "semua") params.set("role", nextRole);
    if (nextAction !== "semua") params.set("action", nextAction);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-role" className="text-xs text-muted-foreground">
          Aktor
        </Label>
        <Select value={role} onValueChange={(v) => (window.location.href = hrefFor(v, action))}>
          <SelectTrigger id="filter-role">
            <SelectValue placeholder="Semua aktor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua aktor</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-action" className="text-xs text-muted-foreground">
          Jenis aksi
        </Label>
        <Select value={action} onValueChange={(v) => (window.location.href = hrefFor(role, v))}>
          <SelectTrigger id="filter-action">
            <SelectValue placeholder="Semua aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua aksi</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>
                {actionLabels[a] ?? a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden lg:block" />
    </div>
  );
}
