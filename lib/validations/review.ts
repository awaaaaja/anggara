import { z } from "zod";

export const rejectProposalSchema = z.object({
  proposalId: z.string().uuid("Proposal tidak valid."),
  alasan: z.string().trim().min(20, "Alasan penolakan minimal 20 karakter."),
});

export const requestRevisionSchema = z.object({
  proposalId: z.string().uuid("Proposal tidak valid."),
  catatan: z.string().trim().min(1, "Catatan revisi wajib diisi."),
});

export const approveProposalSchema = z.object({
  proposalId: z.string().uuid("Proposal tidak valid."),
  nominal: z.coerce.number("Nominal harus angka.").positive("Nominal harus lebih dari 0."),
  catatan: z.string().trim().optional(),
});