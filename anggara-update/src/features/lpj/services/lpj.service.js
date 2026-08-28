import { supabase } from "@/services/supabase";
import { assertRole } from "@/services/rbac";

export async function listLpj({ role, ormawaId, status, search, page = 1, pageSize = 10 } = {}) {
  let q = supabase
    .from("lpj")
    .select(
      "id, status, total_realisasi, created_at, proposal:proposals(judul_kegiatan, ormawa:ormawa(nama))",
      { count: "exact" },
    );
  if (role === "ormawa" && ormawaId) q = q.eq("proposal.ormawa_id", ormawaId);
  if (status) q = q.eq("status", status);
  if (search) q = q.ilike("proposal.judul_kegiatan", `%${search}%`);
  q = q.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { rows: data || [], total: count ?? 0 };
}

export async function getLpjDetail(id) {
  const { data, error } = await supabase
    .from("lpj")
    .select(
      "*, proposal:proposals(id, judul_kegiatan, ormawa:ormawa(nama, jenis), anggaran(nominal_disetujui)), dokumentasi_kegiatan(id, file_url, file_type, caption)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

const LPJ_STATUS = {
  approve: "disetujui",
  reject: "ditolak",
};

const LPJ_ACTION = {
  approve: "lpj.approve",
  reject: "lpj.reject",
};

// LKPKA/MPM review of an LPJ. Updates status + review fields and writes an
// immutable activity_log row. No budget change (anggaran belongs to proposal).
export async function reviewLpj({ id, action, catatan }) {
  const actor = await assertRole(["lkpka", "mpm"]);

  const now = new Date().toISOString();
  const newStatus = LPJ_STATUS[action];

  const { error: le } = await supabase
    .from("lpj")
    .update({
      status: newStatus,
      catatan_review: catatan || null,
      direview_oleh: actor.id,
      direview_pada: now,
    })
    .eq("id", id);
  if (le) throw le;

  const { error: ae } = await supabase.from("activity_logs").insert({
    actor_id: actor.id,
    actor_role: actor.role,
    action: LPJ_ACTION[action],
    target_table: "lpj",
    target_id: id,
    metadata: { catatan: catatan || null },
  });
  if (ae) throw ae;

  return { status: newStatus };
}

export async function updateLpj({ id, values }) {
  await assertRole(["ormawa"]);
  const { error } = await supabase
    .from("lpj")
    .update({
      ringkasan_penggunaan_dana: values.ringkasan_penggunaan_dana,
      rincian_pengeluaran: values.rincian_pengeluaran,
      total_realisasi: values.total_realisasi,
    })
    .eq("id", id);
  if (error) throw error;
  return { id };
}

export async function submitLpj({ id }) {
  const actor = await assertRole(["ormawa"]);

  const { error: le } = await supabase.from("lpj").update({ status: "menunggu" }).eq("id", id);
  if (le) throw le;

  const { error: ae } = await supabase.from("activity_logs").insert({
    actor_id: actor.id,
    actor_role: "ormawa",
    action: "lpj.submit",
    target_table: "lpj",
    target_id: id,
    metadata: {},
  });
  if (ae) throw ae;

  return { id, status: "menunggu" };
}
