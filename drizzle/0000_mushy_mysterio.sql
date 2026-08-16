CREATE TYPE "public"."file_type" AS ENUM('foto', 'video', 'dokumen');--> statement-breakpoint
CREATE TYPE "public"."jenis_ormawa" AS ENUM('bem', 'hima', 'ukm', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('mpm', 'lkpka', 'ormawa');--> statement-breakpoint
CREATE TYPE "public"."status_lpj" AS ENUM('menunggu', 'disetujui', 'revisi_diminta');--> statement-breakpoint
CREATE TYPE "public"."status_ormawa" AS ENUM('aktif', 'nonaktif');--> statement-breakpoint
CREATE TYPE "public"."status_proposal" AS ENUM('draft', 'diajukan', 'revisi_diminta', 'ditolak', 'disetujui', 'kegiatan_berlangsung', 'lpj_menunggu', 'lpj_direview', 'selesai');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"target_table" text NOT NULL,
	"target_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anggaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"nominal_disetujui" numeric(15, 2) NOT NULL,
	"catatan_anggaran" text,
	"ditetapkan_oleh" uuid NOT NULL,
	"ditetapkan_pada" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dokumentasi_kegiatan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lpj_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_type" "file_type" NOT NULL,
	"caption" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lpj" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"ringkasan_penggunaan_dana" text NOT NULL,
	"rincian_pengeluaran" jsonb NOT NULL,
	"total_realisasi" numeric(15, 2) NOT NULL,
	"status" "status_lpj" NOT NULL,
	"catatan_review" text,
	"direview_oleh" uuid,
	"direview_pada" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ormawa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"jenis" "jenis_ormawa" NOT NULL,
	"deskripsi" text NOT NULL,
	"status" "status_ormawa" NOT NULL,
	"dibuat_oleh" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" "role" NOT NULL,
	"full_name" text NOT NULL,
	"ormawa_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"versi" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"catatan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ormawa_id" uuid NOT NULL,
	"judul_kegiatan" text NOT NULL,
	"deskripsi" text NOT NULL,
	"tujuan_kegiatan" text NOT NULL,
	"tanggal_mulai" date NOT NULL,
	"tanggal_selesai" date NOT NULL,
	"lokasi" text NOT NULL,
	"anggaran_diajukan" numeric(15, 2) NOT NULL,
	"status" "status_proposal" NOT NULL,
	"versi_revisi" integer DEFAULT 0 NOT NULL,
	"catatan_review" text,
	"direview_oleh" uuid,
	"direview_pada" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anggaran" ADD CONSTRAINT "anggaran_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anggaran" ADD CONSTRAINT "anggaran_ditetapkan_oleh_profiles_id_fk" FOREIGN KEY ("ditetapkan_oleh") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dokumentasi_kegiatan" ADD CONSTRAINT "dokumentasi_kegiatan_lpj_id_lpj_id_fk" FOREIGN KEY ("lpj_id") REFERENCES "public"."lpj"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpj" ADD CONSTRAINT "lpj_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpj" ADD CONSTRAINT "lpj_direview_oleh_profiles_id_fk" FOREIGN KEY ("direview_oleh") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ormawa" ADD CONSTRAINT "ormawa_dibuat_oleh_profiles_id_fk" FOREIGN KEY ("dibuat_oleh") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_ormawa_id_ormawa_id_fk" FOREIGN KEY ("ormawa_id") REFERENCES "public"."ormawa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_revisions" ADD CONSTRAINT "proposal_revisions_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_ormawa_id_ormawa_id_fk" FOREIGN KEY ("ormawa_id") REFERENCES "public"."ormawa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_direview_oleh_profiles_id_fk" FOREIGN KEY ("direview_oleh") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "anggaran_proposal_id_unique" ON "anggaran" USING btree ("proposal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lpj_proposal_id_unique" ON "lpj" USING btree ("proposal_id");