import { supabase } from "@/services/supabase";

// MPM-wide budget overview. Approved = sum of anggaran.nominal_disetujui,
// realization = sum of lpj.total_realisasi, both grouped per ORMAWA.
export async function getBudgetSummary() {
  const [{ data: anggaran, error: ae }, { data: lpj, error: le }] = await Promise.all([
    supabase
      .from("anggaran")
      .select("nominal_disetujui, proposal:proposals(ormawa_id, ormawa:ormawa(nama))"),
    supabase
      .from("lpj")
      .select("total_realisasi, proposal:proposals(ormawa_id, ormawa:ormawa(nama))"),
  ]);
  if (ae) throw ae;
  if (le) throw le;

  const byOrmawa = new Map();
  const add = (row, amount, key) => {
    const rel = row.proposal;
    if (!rel?.ormawa_id) return;
    const id = rel.ormawa_id;
    if (!byOrmawa.has(id)) {
      byOrmawa.set(id, {
        ormawaId: id,
        nama: rel.ormawa?.nama || "-",
        approved: 0,
        realisasi: 0,
      });
    }
    byOrmawa.get(id)[key] += Number(amount) || 0;
  };

  for (const a of anggaran || []) add(a, a.nominal_disetujui, "approved");
  for (const l of lpj || []) add(l, l.total_realisasi, "realisasi");

  const perOrmawa = [...byOrmawa.values()]
    .map((o) => ({ ...o, sisa: o.approved - o.realisasi }))
    .sort((a, b) => b.approved - a.approved);

  const totalApproved = perOrmawa.reduce((s, o) => s + o.approved, 0);
  const totalRealisasi = perOrmawa.reduce((s, o) => s + o.realisasi, 0);

  return {
    totalApproved,
    totalRealisasi,
    sisa: totalApproved - totalRealisasi,
    perOrmawa,
  };
}
