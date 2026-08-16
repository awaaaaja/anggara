"use client";

import nextDynamic from "next/dynamic";

const Chart = nextDynamic(
  () => import("@/components/mpm/AnggaranPerOrmawaChart").then((m) => m.AnggaranPerOrmawaChart),
  { ssr: false },
);

export function AnggaranChartSection({ data }: { data: Array<{ ormawaNama: string; total: number }> }) {
  return <Chart data={data} />;
}