"use server";

import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { db, dbAsUser } from "@/lib/db/client";
import { lpj, proposals } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/queries/activity-log";

type ActionResult = { ok: true } | { error: string };

async function guardLkpkaLpjReview(proposalId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Sesi berakhir. Silakan masuk kembali." };
  if (profile.role !== "lkpka") {
    return { ok: false as const, error: "Hanya LKPKA yang dapat mereview LPJ." };
  }
  const [lpjRow] = await db
    .select({ id: lpj.id, proposal_id: lpj.proposal_id, status: lpj.status })
    .from(lpj)
    .where(eq(lpj.proposal_id, proposalId))
    .limit(1);
  if (!lpjRow) return { ok: false as const, error: "LPJ belum disubmit." };
  if (!["menunggu", "revisi_diminta"].includes(lpjRow.status)) {
    return { ok: false as const, error: "LPJ sudah diproses." };
  }
  return { ok: true as const, profile, lpjRow };
}

export async function mintaRevisiLpjAction(formData: FormData): Promise<ActionResult> {
  const proposalId = String(formData.get("proposalId") ?? "");
  const catatan = String(formData.get("catatan") ?? "").trim();
  if (!proposalId) return { error: "Data LPJ tidak ditemukan." };
  if (catatan.length < 10) {
    return { error: "Catatan revisi minimal 10 karakter." };
  }

  const guard = await guardLkpkaLpjReview(proposalId);
  if (!guard.ok) return { error: guard.error };
  if (guard.lpjRow.status === "revisi_diminta") {
    return { error: "LPJ ini sedang menunggu perbaikan dari ormawa." };
  }

  await dbAsUser(guard.profile.id, async (tx) => {
    await tx
      .update(lpj)
      .set({
        status: "revisi_diminta",
        catatan_review: catatan,
        direview_oleh: guard.profile.id,
        direview_pada: new Date(),
      })
      .where(eq(lpj.id, guard.lpjRow.id));
    await tx.update(proposals).set({ status: "lpj_menunggu" }).where(eq(proposals.id, proposalId));
    await logActivity(
      {
        actorId: guard.profile.id,
        actorRole: "lkpka",
        action: "lpj.revisi_diminta",
        targetTable: "lpj",
        targetId: guard.lpjRow.id,
        metadata: { catatan, proposal_id: proposalId },
      },
      tx,
    );
  });
  return { ok: true };
}

export async function setujuiLpjAction(formData: FormData): Promise<ActionResult> {
  const proposalId = String(formData.get("proposalId") ?? "");
  if (!proposalId) return { error: "Data LPJ tidak ditemukan." };

  const guard = await guardLkpkaLpjReview(proposalId);
  if (!guard.ok) return { error: guard.error };

  await dbAsUser(guard.profile.id, async (tx) => {
    await tx
      .update(lpj)
      .set({
        status: "disetujui",
        catatan_review: null,
        direview_oleh: guard.profile.id,
        direview_pada: new Date(),
      })
      .where(eq(lpj.id, guard.lpjRow.id));
    await tx.update(proposals).set({ status: "selesai" }).where(eq(proposals.id, proposalId));
    await logActivity(
      {
        actorId: guard.profile.id,
        actorRole: "lkpka",
        action: "lpj.approve",
        targetTable: "lpj",
        targetId: guard.lpjRow.id,
        metadata: { proposal_id: proposalId },
      },
      tx,
    );
  });
  return { ok: true };
}
