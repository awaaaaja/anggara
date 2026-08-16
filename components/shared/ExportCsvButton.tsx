"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function toCsv(headers: string[], rows: string[][]) {
  const escape = (cell: string) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
  return "\uFEFF" + [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

export function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Ekspor CSV",
}: {
  filename: string;
  headers: string[];
  rows: string[][];
  label?: string;
}) {
  function download() {
    const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={download}>
      <Download className="size-4" />
      {label}
    </Button>
  );
}