import type { StatusLpj, StatusProposal } from "@/lib/db/schema";

export const STATUS_PROPOSAL_LABEL: Record<StatusProposal, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  revisi_diminta: "Revisi Diminta",
  ditolak: "Ditolak",
  disetujui: "Disetujui",
  kegiatan_berlangsung: "Kegiatan Berlangsung",
  lpj_menunggu: "Menunggu LPJ",
  lpj_direview: "LPJ Direview",
  selesai: "Selesai",
};

export const STATUS_PROPOSAL_BADGE: Record<
  StatusProposal,
  "zinc" | "amber" | "orange" | "red" | "emerald" | "sky" | "blue" | "green" | "violet"
> = {
  draft: "zinc",
  diajukan: "amber",
  revisi_diminta: "orange",
  ditolak: "red",
  disetujui: "emerald",
  kegiatan_berlangsung: "sky",
  lpj_menunggu: "violet",
  lpj_direview: "blue",
  selesai: "green",
};

export const STATUS_LPJ_LABEL: Record<StatusLpj, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  revisi_diminta: "Revisi Diminta",
};

export const STATUS_PROPOSAL_FILTER: Array<{ value: string; label: string }> = [
  { value: "semua", label: "Semua status" },
  ...Object.entries(STATUS_PROPOSAL_LABEL).map(([value, label]) => ({ value, label })),
];

export const RUPIAH = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});