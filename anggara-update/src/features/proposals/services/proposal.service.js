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

const REVIEW_STATUS = {
  approve: "disetujui",
  reject: "ditolak",
  revision: "revisi_diminta",
};

const REVIEW_ACTION = {
  approve: "proposal.approve",
  reject: "proposal.reject",
  revision: "proposal.revisi_diminta",
};

// LKPKA review. Updates proposal status, optionally inserts the approved
// budget (anggaran), and writes an immutable activity_log row. Sequential
// client calls within the user's session (RLS enforces role scope).
export async function reviewProposal({ id, action, nominal, catatan }) {
  const { data: userData, error: ue } = await supabase.auth.getUser();
  if (ue) throw ue;
  const actor = userData.user;
  if (!actor) throw new Error("Sesi tidak valid");

  const now = new Date().toISOString();
  const newStatus = REVIEW_STATUS[action];

  const { error: pe } = await supabase
    .from("proposals")
    .update({
      status: newStatus,
      catatan_review: catatan || null,
      direview_oleh: actor.id,
      direview_pada: now,
    })
    .eq("id", id);
  if (pe) throw pe;

  if (action === "approve") {
    const { error: ae } = await supabase.from("anggaran").insert({
      proposal_id: id,
      nominal_disetujui: nominal,
      catatan_anggaran: catatan || null,
      ditetapkan_oleh: actor.id,
      ditetapkan_pada: now,
    });
    if (ae) throw ae;
  }

  const { error: le } = await supabase.from("activity_logs").insert({
    actor_id: actor.id,
    actor_role: "lkpka",
    action: REVIEW_ACTION[action],
    target_table: "proposals",
    target_id: id,
    metadata: {
      catatan: catatan || null,
      nominal: action === "approve" ? nominal : null,
    },
  });
  if (le) throw le;

  return { status: newStatus };
}

export async function createProposal({ ormawaId, values }) {
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      ormawa_id: ormawaId,
      judul_kegiatan: values.judul_kegiatan,
      deskripsi: values.deskripsi,
      tujuan_kegiatan: values.tujuan_kegiatan,
      tanggal_mulai: values.tanggal_mulai,
      tanggal_selesai: values.tanggal_selesai,
      lokasi: values.lokasi,
      anggaran_diajukan: values.anggaran_diajukan,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function updateProposal({ id, values }) {
  const { error } = await supabase
    .from("proposals")
    .update({
      judul_kegiatan: values.judul_kegiatan,
      deskripsi: values.deskripsi,
      tujuan_kegiatan: values.tujuan_kegiatan,
      tanggal_mulai: values.tanggal_mulai,
      tanggal_selesai: values.tanggal_selesai,
      lokasi: values.lokasi,
      anggaran_diajukan: values.anggaran_diajukan,
    })
    .eq("id", id);
  if (error) throw error;
  return { id };
}

export async function submitProposal({ id }) {
  const { data: userData, error: ue } = await supabase.auth.getUser();
  if (ue) throw ue;
  const actor = userData.user;
  if (!actor) throw new Error("Sesi tidak valid");

  const { error: pe } = await supabase
    .from("proposals")
    .update({ status: "diajukan" })
    .eq("id", id);
  if (pe) throw pe;

  const { error: le } = await supabase.from("activity_logs").insert({
    actor_id: actor.id,
    actor_role: "ormawa",
    action: "proposal.submit",
    target_table: "proposals",
    target_id: id,
    metadata: {},
  });
  if (le) throw le;

  return { id, status: "diajukan" };
}
