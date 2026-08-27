import { supabase } from "@/services/supabase";

export async function listOrmawa({ search, page = 1, pageSize = 10 } = {}) {
  let q = supabase
    .from("ormawa")
    .select("id, nama, jenis, deskripsi, status, created_at", { count: "exact" });
  if (search) q = q.ilike("nama", `%${search}%`);
  q = q.order("nama", { ascending: true });
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { rows: data || [], total: count ?? 0 };
}

export async function getOrmawa(id) {
  const { data, error } = await supabase
    .from("ormawa")
    .select("id, nama, jenis, deskripsi, status")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrmawa(payload) {
  const { data, error } = await supabase
    .from("ormawa")
    .insert({
      nama: payload.nama,
      jenis: payload.jenis,
      deskripsi: payload.deskripsi || null,
      status: payload.status || "aktif",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrmawa(id, payload) {
  const { error } = await supabase
    .from("ormawa")
    .update({
      nama: payload.nama,
      jenis: payload.jenis,
      deskripsi: payload.deskripsi || null,
      status: payload.status,
    })
    .eq("id", id);
  if (error) throw error;
  return { id };
}

export async function deleteOrmawa(id) {
  const { error } = await supabase.from("ormawa").delete().eq("id", id);
  if (error) throw error;
  return { id };
}
