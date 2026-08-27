import { supabase } from "@/services/supabase";

export async function listProposals({
  role,
  ormawaId,
  status,
  search,
  page = 1,
  pageSize = 10,
} = {}) {
  let q = supabase
    .from("proposals")
    .select(
      "id, judul_kegiatan, status, anggaran_diajukan, created_at, tanggal_mulai, ormawa:ormawa(nama)",
      { count: "exact" },
    );
  if (role === "ormawa" && ormawaId) q = q.eq("ormawa_id", ormawaId);
  if (status) q = q.eq("status", status);
  if (search) q = q.ilike("judul_kegiatan", `%${search}%`);
  q = q.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { rows: data || [], total: count ?? 0 };
}

export async function getProposalDetail(id) {
  const { data, error } = await supabase
    .from("proposals")
    .select(
      "*, ormawa:ormawa(nama, jenis, status), anggaran(*), proposal_revisions(id, versi, catatan, created_at)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
