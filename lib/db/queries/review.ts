"use server";

import { eq } from "drizzle-orm";
import { getCurrentProfile, type CurrentProfile } from "@/lib/auth/get-current-profile";
import { db } from "@/lib/db/client";
import { anggaran, proposals } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/queries/activity-log";
import {
  approveProposalSchema,
  rejectProposalSchema,
  requestRevisionSchema,
} from "@/lib/validations/review";

type ActionResult = { ok: true } | { error: string };

type ReviewGuard =
  | { ok: false; error: string }
  | { ok: true; profile: CurrentProfile; proposalId: string };

async function guardLkpkaReview(proposalId: string): Promise<ReviewGuard> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sesi tidak valid. Silakan login ulang." };
  if (profile.role !== "lkpka") return { ok: false, error: "Anda tidak berwenang melakukan aksi ini." };

  const [proposal] = await db
    .select({ id: proposals.id, status: proposals.status })
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);
  if (!proposal) return { ok: false, error: "Proposal tidak ditemukan." };
  if (proposal.status !== "diajukan") {
    return { ok: false, error: "Proposal tidak dalam status diajukan." };
  }
  return { ok: true, profile, proposalId: proposal.id };
}

export async function rejectProposalAction(formData: FormData): Promise<ActionResult> {
  const parsed = rejectProposalSchema.safeParse({
    proposalId: formData.get("proposalId"),
    alasan: formData.get("alasan"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const guard = await guardLkpkaReview(parsed.data.proposalId);
  if (!guard.ok) return { error: guard.error };

  const now = new Date();
  const reviewerId = guard.profile.id;
  await db.transaction(async (tx) => {
    await tx
      .update(proposals)
      .set({
        status: "ditolak",
        catatan_review: parsed.data.alasan,
        direview_oleh: reviewerId,
        direview_pada: now,
      })
      .where(eq(proposals.id, guard.proposalId));
    await logActivity(
      {
        actorId: reviewerId,
        actorRole: "lkpka",
        action: "proposal.reject",
        targetTable: "proposals",
        targetId: guard.proposalId,
        metadata: { alasan: parsed.data.alasan },
      },
      tx,
    );
  });

  return { ok: true };
}

export async function requestRevisionAction(formData: FormData): Promise<ActionResult> {
  const parsed = requestRevisionSchema.safeParse({
    proposalId: formData.get("proposalId"),
    catatan: formData.get("catatan"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const guard = await guardLkpkaReview(parsed.data.proposalId);
  if (!guard.ok) return { error: guard.error };

  const now = new Date();
  const reviewerId = guard.profile.id;
  await db.transaction(async (tx) => {
    await tx
      .update(proposals)
      .set({
        status: "revisi_diminta",
        catatan_review: parsed.data.catatan,
        direview_oleh: reviewerId,
        direview_pada: now,
      })
      .where(eq(proposals.id, guard.proposalId));
    await logActivity(
      {
        actorId: reviewerId,
        actorRole: "lkpka",
        action: "proposal.revisi_diminta",
        targetTable: "proposals",
        targetId: guard.proposalId,
        metadata: { catatan: parsed.data.catatan },
      },
      tx,
    );
  });

  return { ok: true };
}

export async function approveProposalAction(formData: FormData): Promise<ActionResult> {
  const parsed = approveProposalSchema.safeParse({
    proposalId: formData.get("proposalId"),
    nominal: formData.get("nominal"),
    catatan: formData.get("catatan") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const guard = await guardLkpkaReview(parsed.data.proposalId);
  if (!guard.ok) return { error: guard.error };

  const now = new Date();
  const reviewerId = guard.profile.id;
  await db.transaction(async (tx) => {
    await tx
      .update(proposals)
      .set({
        status: "disetujui",
        catatan_review: parsed.data.catatan ?? null,
        direview_oleh: reviewerId,
        direview_pada: now,
      })
      .where(eq(proposals.id, guard.proposalId));

    await tx.insert(anggaran).values({
      proposal_id: guard.proposalId,
      nominal_disetujui: String(parsed.data.nominal),
      catatan_anggaran: parsed.data.catatan ?? null,
      ditetapkan_oleh: reviewerId,
      ditetapkan_pada: now,
    });

    await logActivity(
      {
        actorId: reviewerId,
        actorRole: "lkpka",
        action: "proposal.approve",
        targetTable: "proposals",
        targetId: guard.proposalId,
        metadata: { nominal: String(parsed.data.nominal), catatan: parsed.data.catatan ?? null },
      },
      tx,
    );
  });

  return { ok: true };
}