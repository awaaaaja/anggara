import { pgEnum, pgSchema, pgTable, uuid, text, timestamp, date, integer, numeric, jsonb, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["mpm", "lkpka", "ormawa"]);
export const jenisOrmawaEnum = pgEnum("jenis_ormawa", ["bem", "hima", "ukm", "lainnya"]);
export const statusOrmawaEnum = pgEnum("status_ormawa", ["aktif", "nonaktif"]);
export const statusProposalEnum = pgEnum("status_proposal", [
  "draft",
  "diajukan",
  "revisi_diminta",
  "ditolak",
  "disetujui",
  "kegiatan_berlangsung",
  "lpj_menunggu",
  "lpj_direview",
  "selesai",
]);
export const statusLpjEnum = pgEnum("status_lpj", ["menunggu", "disetujui", "revisi_diminta"]);
export const fileTypeEnum = pgEnum("file_type", ["foto", "video", "dokumen"]);

const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const ormawa = pgTable(
  "ormawa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nama: text("nama").notNull(),
    jenis: jenisOrmawaEnum("jenis").notNull(),
    deskripsi: text("deskripsi").notNull(),
    status: statusOrmawaEnum("status").notNull(),
    dibuat_oleh: uuid("dibuat_oleh").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.dibuat_oleh],
      foreignColumns: [profiles.id],
    }),
  ],
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- template tipe utk memutus referensi circular TS
const _profilesBase = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  role: roleEnum("role").notNull(),
  full_name: text("full_name").notNull(),
  ormawa_id: uuid("ormawa_id"),
  logo_url: text("logo_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles: typeof _profilesBase = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id),
    role: roleEnum("role").notNull(),
    full_name: text("full_name").notNull(),
    ormawa_id: uuid("ormawa_id"),
    logo_url: text("logo_url"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ormawa_id],
      foreignColumns: [ormawa.id],
    }),
  ],
);

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  ormawa_id: uuid("ormawa_id")
    .notNull()
    .references(() => ormawa.id),
  judul_kegiatan: text("judul_kegiatan").notNull(),
  divisi_pengaju: text("divisi_pengaju"),
  deskripsi: text("deskripsi").notNull(),
  tujuan_kegiatan: text("tujuan_kegiatan").notNull(),
  tanggal_mulai: date("tanggal_mulai", { mode: "date" }).notNull(),
  tanggal_selesai: date("tanggal_selesai", { mode: "date" }).notNull(),
  lokasi: text("lokasi").notNull(),
  anggaran_diajukan: numeric("anggaran_diajukan", { precision: 15, scale: 2 }).notNull(),
  file_proposal_url: text("file_proposal_url"),
  status: statusProposalEnum("status").notNull(),
  versi_revisi: integer("versi_revisi").default(0).notNull(),
  catatan_review: text("catatan_review"),
  direview_oleh: uuid("direview_oleh").references(() => profiles.id),
  direview_pada: timestamp("direview_pada", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proposalRevisions = pgTable("proposal_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposal_id: uuid("proposal_id")
    .notNull()
    .references(() => proposals.id),
  versi: integer("versi").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  catatan: text("catatan").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const anggaran = pgTable(
  "anggaran",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposal_id: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id),
    nominal_disetujui: numeric("nominal_disetujui", { precision: 15, scale: 2 }).notNull(),
    catatan_anggaran: text("catatan_anggaran"),
    ditetapkan_oleh: uuid("ditetapkan_oleh")
      .notNull()
      .references(() => profiles.id),
    ditetapkan_pada: timestamp("ditetapkan_pada", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("anggaran_proposal_id_unique").on(table.proposal_id)],
);

export const lpj = pgTable(
  "lpj",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposal_id: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id),
    ringkasan_penggunaan_dana: text("ringkasan_penggunaan_dana").notNull(),
    rincian_pengeluaran: jsonb("rincian_pengeluaran").notNull(),
    total_realisasi: numeric("total_realisasi", { precision: 15, scale: 2 }).notNull(),
    file_lpj_url: text("file_lpj_url"),
    status: statusLpjEnum("status").notNull(),
    catatan_review: text("catatan_review"),
    direview_oleh: uuid("direview_oleh").references(() => profiles.id),
    direview_pada: timestamp("direview_pada", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("lpj_proposal_id_unique").on(table.proposal_id)],
);

export const dokumentasiKegiatan = pgTable("dokumentasi_kegiatan", {
  id: uuid("id").primaryKey().defaultRandom(),
  lpj_id: uuid("lpj_id")
    .notNull()
    .references(() => lpj.id),
  file_url: text("file_url").notNull(),
  file_type: fileTypeEnum("file_type").notNull(),
  caption: text("caption"),
  uploaded_at: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor_id: uuid("actor_id")
    .notNull()
    .references(() => profiles.id),
  actor_role: text("actor_role").notNull(),
  action: text("action").notNull(),
  target_table: text("target_table").notNull(),
  target_id: uuid("target_id").notNull(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  ormawa: one(ormawa, {
    fields: [profiles.ormawa_id],
    references: [ormawa.id],
  }),
}));

export const ormawaRelations = relations(ormawa, ({ one }) => ({
  dibuatOleh: one(profiles, {
    fields: [ormawa.dibuat_oleh],
    references: [profiles.id],
  }),
}));

export type Role = (typeof roleEnum.enumValues)[number];
export type JenisOrmawa = (typeof jenisOrmawaEnum.enumValues)[number];
export type StatusOrmawa = (typeof statusOrmawaEnum.enumValues)[number];
export type StatusProposal = (typeof statusProposalEnum.enumValues)[number];
export type StatusLpj = (typeof statusLpjEnum.enumValues)[number];
export type FileType = (typeof fileTypeEnum.enumValues)[number];