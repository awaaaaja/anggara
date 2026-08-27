import { supabase } from "@/services/supabase";

async function count(table, filter = {}) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export async function getMpmDashboard() {
  const [
    totalProposals,
    totalLpj,
    totalOrmawa,
    { data: anggaran, error: aErr },
    { data: proposals, error: pErr },
    { data: activity, error: actErr },
  ] = await Promise.all([
    count("proposals"),
    count("lpj"),
    count("ormawa", { status: "aktif" }),
    supabase.from("anggaran").select("nominal_disetujui"),
    supabase
      .from("proposals")
      .select("id, judul_kegiatan, status, anggaran_diajukan, created_at, ormawa:ormawa(nama)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("activity_logs")
      .select("id, action, target_table, actor_role, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  if (aErr) throw aErr;
  if (pErr) throw pErr;
  if (actErr) throw actErr;
  const approvedBudget = (anggaran || []).reduce(
    (s, r) => s + (Number(r.nominal_disetujui) || 0),
    0,
  );
  return {
    stats: { totalProposals, totalLpj, totalOrmawa, approvedBudget },
    recentProposals: proposals || [],
    recentActivity: activity || [],
  };
}

export async function getLkpkaDashboard() {
  const [
    proposalMenunggu,
    lpjMenunggu,
    proposalDisetujui,
    lpjDisetujui,
    { data: proposals, error: pErr },
    { data: lpj, error: lErr },
  ] = await Promise.all([
    count("proposals", { status: "diajukan" }),
    count("lpj", { status: "menunggu" }),
    count("proposals", { status: "disetujui" }),
    count("lpj", { status: "disetujui" }),
    supabase
      .from("proposals")
      .select("id, judul_kegiatan, status, anggaran_diajukan, created_at, ormawa:ormawa(nama)")
      .eq("status", "diajukan")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("lpj")
      .select(
        "id, status, total_realisasi, created_at, proposal:proposals(judul_kegiatan, ormawa:ormawa(nama))",
      )
      .eq("status", "menunggu")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  if (pErr) throw pErr;
  if (lErr) throw lErr;
  return {
    stats: { proposalMenunggu, lpjMenunggu, proposalDisetujui, lpjDisetujui },
    proposalReview: proposals || [],
    lpjReview: lpj || [],
  };
}

export async function getOrmawaDashboard(ormawaId) {
  if (!ormawaId) {
    return {
      stats: { totalProposals: 0, draft: 0, disetujui: 0, myLpj: 0 },
      myProposals: [],
    };
  }
  const { data: props, error: pErr } = await supabase
    .from("proposals")
    .select("id, judul_kegiatan, status, anggaran_diajukan, created_at")
    .eq("ormawa_id", ormawaId)
    .order("created_at", { ascending: false });
  if (pErr) throw pErr;
  const list = props || [];
  const ids = list.map((p) => p.id);
  const { count: myLpj, error: lErr } = await supabase
    .from("lpj")
    .select("*", { count: "exact", head: true })
    .in("proposal_id", ids.length ? ids : ["__none__"]);
  if (lErr) throw lErr;

  const statusOpen = ["draft", "revisi_diminta"];
  const statusDone = [
    "disetujui",
    "kegiatan_berlangsung",
    "lpj_menunggu",
    "lpj_direview",
    "selesai",
  ];
  const stats = {
    totalProposals: list.length,
    draft: list.filter((p) => statusOpen.includes(p.status)).length,
    disetujui: list.filter((p) => statusDone.includes(p.status)).length,
    myLpj: myLpj ?? 0,
  };
  return { stats, myProposals: list };
}
