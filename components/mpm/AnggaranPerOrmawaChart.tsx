"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnggaranPerOrmawaChart({ data }: { data: Array<{ ormawaNama: string; total: number }> }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada anggaran disetujui.</p>;
  }

  const chartData = data.map((d) => ({
    nama: d.ormawaNama.length > 16 ? d.ormawaNama.slice(0, 15) + "…" : d.ormawaNama,
    total: d.total,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)} />
          <YAxis type="category" dataKey="nama" width={110} />
          <Tooltip
            formatter={(v) =>
              new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v ?? 0))
            }
          />
          <Bar dataKey="total" fill="#16a34a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
