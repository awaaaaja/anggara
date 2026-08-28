-- ============================================================================
-- SPRINT 11 — SECURITY: RLS audit + remediation
-- Applied directly to project dfldijxfnpttzjjukyih (Supabase).
-- Baseline: existing RLS (public schema) was mostly correct; the gap was the
-- STORAGE layer (documentation bucket was public) + activity_logs insert could
-- be forged. Table-level cross-role SELECT/INSERT/UPDATE was already enforced.
-- ============================================================================
--
-- AUDIT FINDINGS (per role)
--   ORMAWA : SELECT/INSERT/UPDATE scoped to own ormawa_id via get_user_ormawa_id()
--            (incl. proposal draft->diajukan fix from prior hotfix).  OK.
--   LKPKA  : SELECT all (review); UPDATE review fields only.            OK.
--   MPM    : SELECT all read-only; NO insert/update/delete on transaction
--            tables (only ormawa management).                           OK.
--   profiles/ormawa: ormawa sees own; staff sees all; MPM mutates.      OK.
--   activity_logs: INSERT had WITH CHECK true -> a user could forge
--            actor_id/actor_role of another user.                      FIXED.
--   storage.objects: `dokumentasi-kegiatan` bucket was PUBLIC + policy
--            `dokumentasi_public_read` -> LPJ photos/videos world-readable
--            by URL. `logo` kept public (non-sensitive avatar).         FIXED.
--
-- REMEDIATION
-- ============================================================================

-- 1. Lock down the sensitive documentation bucket; add a private bucket for
--    proposal PDFs. Logos remain public (avatars are non-sensitive, internal).
UPDATE storage.buckets SET public = false WHERE id = 'dokumentasi-kegiatan';

INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-dokumen', 'proposal-dokumen', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Remove public read on documentation.
DROP POLICY IF EXISTS "dokumentasi_public_read" ON storage.objects;

-- 3. Restrict the generic owner policies to the logo bucket only (dokumentasi
--    now uses lpj-ownership policies below with correct folder semantics).
DROP POLICY IF EXISTS "storage_own_write" ON storage.objects;
DROP POLICY IF EXISTS "storage_own_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_own_delete" ON storage.objects;

CREATE POLICY "storage_own_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logo' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_own_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'logo' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'logo' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_own_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'logo' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. dokumentasi-kegiatan: owner = ORMAWA of the LPJ; LKPKA/MPM may read.
CREATE POLICY "dokumentasi_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'dokumentasi-kegiatan'
    AND (
      get_user_role() = ANY (ARRAY['lkpka','mpm'])
      OR (get_user_role() = 'ormawa' AND EXISTS (
        SELECT 1 FROM lpj l JOIN proposals p ON p.id = l.proposal_id
        WHERE l.id = (storage.foldername(name))[1]::uuid
          AND p.ormawa_id = get_user_ormawa_id()
      ))
    )
  );

CREATE POLICY "dokumentasi_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dokumentasi-kegiatan'
    AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM lpj l JOIN proposals p ON p.id = l.proposal_id
      WHERE l.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id())
  );

CREATE POLICY "dokumentasi_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'dokumentasi-kegiatan' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM lpj l JOIN proposals p ON p.id = l.proposal_id WHERE l.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()))
  WITH CHECK (bucket_id = 'dokumentasi-kegiatan' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM lpj l JOIN proposals p ON p.id = l.proposal_id WHERE l.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()));

CREATE POLICY "dokumentasi_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dokumentasi-kegiatan' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM lpj l JOIN proposals p ON p.id = l.proposal_id WHERE l.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()));

-- 5. proposal-dokumen: owner = ORMAWA of the proposal; LKPKA/MPM may read.
CREATE POLICY "proposal_dokumen_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'proposal-dokumen'
    AND (
      get_user_role() = ANY (ARRAY['lkpka','mpm'])
      OR (get_user_role() = 'ormawa' AND EXISTS (
        SELECT 1 FROM proposals p
        WHERE p.id = (storage.foldername(name))[1]::uuid
          AND p.ormawa_id = get_user_ormawa_id()
      ))
    )
  );

CREATE POLICY "proposal_dokumen_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proposal-dokumen' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM proposals p WHERE p.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()));

CREATE POLICY "proposal_dokumen_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'proposal-dokumen' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM proposals p WHERE p.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()))
  WITH CHECK (bucket_id = 'proposal-dokumen' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM proposals p WHERE p.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()));

CREATE POLICY "proposal_dokumen_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'proposal-dokumen' AND get_user_role() = 'ormawa'
    AND EXISTS (SELECT 1 FROM proposals p WHERE p.id = (storage.foldername(name))[1]::uuid AND p.ormawa_id = get_user_ormawa_id()));

-- 6. activity_logs: prevent forging actor identity/role on insert.
DROP POLICY IF EXISTS "authenticated_insert_activity_logs" ON activity_logs;
CREATE POLICY "authenticated_insert_activity_logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND actor_role = get_user_role());

-- ============================================================================
-- VERIFICATION (direct Supabase client, cross-role requests — not via UI)
--   PASS  ORMAWA select-all returns only own rows (4 of 9)
--   PASS  ORMAWA blocked from reading another ormawa's proposal row
--   PASS  ORMAWA insert with foreign ormawa_id rejected (SQLSTATE 42501)
--   PASS  MPM cannot UPDATE proposals (0 rows affected, status unchanged)
--   PASS  activity_logs insert rejected when actor_id != self (42501)
--   PASS  activity_logs insert rejected when actor_role forged (42501)
--   PASS  anon cannot download private dokumentasi object (401/400)
--   PASS  ORMAWA cannot list another ormawa's LPJ storage folder
--   PASS  LKPKA CAN read all proposals (expected-good)
-- ============================================================================
