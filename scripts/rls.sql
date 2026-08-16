-- ============================================================
-- RLS Policies ANGGARA — sesuai AGENTS.md bagian 7
-- Jalankan: npx tsx scripts/apply-rls.ts
-- ============================================================

-- Helper security definer (hindari infinite recursion policy profiles)
create or replace function public.get_user_role() returns text
language sql security definer stable
as $$ select role from profiles where id = auth.uid() $$;

create or replace function public.get_user_ormawa_id() returns uuid
language sql security definer stable
as $$ select ormawa_id from profiles where id = auth.uid() $$;

-- Update logo milik sendiri saja (upload logo profil oleh pemilik akun).
-- Security definer agar hanya kolom logo_url yang bisa diubah — mencegah
-- user mengubah role/kolom lain lewat policy update-own pada profiles.
create or replace function public.update_own_logo(new_logo_url text) returns void
language sql security definer
as $$
  update profiles set logo_url = new_logo_url where id = auth.uid()
$$;

-- ============ ENABLE RLS ============
alter table public.profiles enable row level security;
alter table public.ormawa enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_revisions enable row level security;
alter table public.anggaran enable row level security;
alter table public.lpj enable row level security;
alter table public.dokumentasi_kegiatan enable row level security;
alter table public.activity_logs enable row level security;

-- ============ PROFILES ============
-- select: ORMAWA hanya dirinya sendiri; MPM/LKPKA semua
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_select_all_staff on public.profiles;
create policy profiles_select_all_staff on public.profiles
  for select using (get_user_role() in ('mpm', 'lkpka'));

-- insert/update/delete: hanya MPM
drop policy if exists profiles_insert_mpm on public.profiles;
create policy profiles_insert_mpm on public.profiles
  for insert to authenticated with check (get_user_role() = 'mpm');

drop policy if exists profiles_update_mpm on public.profiles;
create policy profiles_update_mpm on public.profiles
  for update to authenticated using (get_user_role() = 'mpm');

drop policy if exists profiles_delete_mpm on public.profiles;
create policy profiles_delete_mpm on public.profiles
  for delete to authenticated using (get_user_role() = 'mpm');

-- ============ ORMAWA ============
-- select: ORMAWA hanya ormawa-nya sendiri; MPM/LKPKA semua
drop policy if exists ormawa_select_own on public.ormawa;
create policy ormawa_select_own on public.ormawa
  for select using (id = get_user_ormawa_id());

drop policy if exists ormawa_select_all_staff on public.ormawa;
create policy ormawa_select_all_staff on public.ormawa
  for select using (get_user_role() in ('mpm', 'lkpka'));

-- insert/update/delete: hanya MPM
drop policy if exists ormawa_insert_mpm on public.ormawa;
create policy ormawa_insert_mpm on public.ormawa
  for insert to authenticated with check (get_user_role() = 'mpm');

drop policy if exists ormawa_update_mpm on public.ormawa;
create policy ormawa_update_mpm on public.ormawa
  for update to authenticated using (get_user_role() = 'mpm');

drop policy if exists ormawa_delete_mpm on public.ormawa;
create policy ormawa_delete_mpm on public.ormawa
  for delete to authenticated using (get_user_role() = 'mpm');

-- ============ PROPOSALS ============
-- select: ORMAWA own; LKPKA & MPM semua
drop policy if exists ormawa_select_own_proposals on public.proposals;
create policy ormawa_select_own_proposals on public.proposals
  for select using (ormawa_id = get_user_ormawa_id());

drop policy if exists lkpka_mpm_select_all_proposals on public.proposals;
create policy lkpka_mpm_select_all_proposals on public.proposals
  for select using (get_user_role() in ('lkpka', 'mpm'));

-- insert: hanya ORMAWA pemilik
drop policy if exists ormawa_insert_own_proposal on public.proposals;
create policy ormawa_insert_own_proposal on public.proposals
  for insert to authenticated with check (
    ormawa_id = get_user_ormawa_id() and get_user_role() = 'ormawa'
  );

-- update: LKPKA (review); ORMAWA own hanya saat draft/revisi_diminta
drop policy if exists lkpka_update_review_fields on public.proposals;
create policy lkpka_update_review_fields on public.proposals
  for update to authenticated using (get_user_role() = 'lkpka');

drop policy if exists ormawa_update_own_draft_or_revisi on public.proposals;
create policy ormawa_update_own_draft_or_revisi on public.proposals
  for update to authenticated using (
    ormawa_id = get_user_ormawa_id() and status in ('draft', 'revisi_diminta')
  );

-- delete: TIDAK ADA policy untuk role manapun

-- ============ PROPOSAL_REVISIONS ============
-- select: ORMAWA pemilik proposal; LKPKA/MPM semua
drop policy if exists ormawa_select_own_revisions on public.proposal_revisions;
create policy ormawa_select_own_revisions on public.proposal_revisions
  for select using (
    proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
  );

drop policy if exists lkpka_mpm_select_all_revisions on public.proposal_revisions;
create policy lkpka_mpm_select_all_revisions on public.proposal_revisions
  for select using (get_user_role() in ('lkpka', 'mpm'));

-- insert: ORMAWA pemilik proposal
drop policy if exists ormawa_insert_own_revision on public.proposal_revisions;
create policy ormawa_insert_own_revision on public.proposal_revisions
  for insert to authenticated with check (
    get_user_role() = 'ormawa'
    and proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
  );

-- update/delete: TIDAK ADA

-- ============ ANGGARAN ============
-- select: ORMAWA pemilik; LKPKA/MPM semua
drop policy if exists ormawa_select_own_anggaran on public.anggaran;
create policy ormawa_select_own_anggaran on public.anggaran
  for select using (
    proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
  );

drop policy if exists lkpka_mpm_select_all_anggaran on public.anggaran;
create policy lkpka_mpm_select_all_anggaran on public.anggaran
  for select using (get_user_role() in ('lkpka', 'mpm'));

-- insert/update: hanya LKPKA
drop policy if exists lkpka_insert_anggaran on public.anggaran;
create policy lkpka_insert_anggaran on public.anggaran
  for insert to authenticated with check (get_user_role() = 'lkpka');

drop policy if exists lkpka_update_anggaran on public.anggaran;
create policy lkpka_update_anggaran on public.anggaran
  for update to authenticated using (get_user_role() = 'lkpka');

-- delete: TIDAK ADA

-- ============ LPJ ============
-- select: ORMAWA pemilik; LKPKA/MPM semua
drop policy if exists ormawa_select_own_lpj on public.lpj;
create policy ormawa_select_own_lpj on public.lpj
  for select using (
    proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
  );

drop policy if exists lkpka_mpm_select_all_lpj on public.lpj;
create policy lkpka_mpm_select_all_lpj on public.lpj
  for select using (get_user_role() in ('lkpka', 'mpm'));

-- insert: ORMAWA pemilik
drop policy if exists ormawa_insert_own_lpj on public.lpj;
create policy ormawa_insert_own_lpj on public.lpj
  for insert to authenticated with check (
    get_user_role() = 'ormawa'
    and proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
  );

-- update: LKPKA (review); ORMAWA own saat status menunggu/revisi_diminta
drop policy if exists lkpka_update_review_lpj on public.lpj;
create policy lkpka_update_review_lpj on public.lpj
  for update to authenticated using (get_user_role() = 'lkpka');

drop policy if exists ormawa_update_own_lpj on public.lpj;
create policy ormawa_update_own_lpj on public.lpj
  for update to authenticated using (
    proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
    and status in ('menunggu', 'revisi_diminta')
  );

-- delete: TIDAK ADA

-- ============ DOKUMENTASI_KEGIATAN ============
-- select: ORMAWA pemilik; LKPKA/MPM semua
drop policy if exists ormawa_select_own_dokumentasi on public.dokumentasi_kegiatan;
create policy ormawa_select_own_dokumentasi on public.dokumentasi_kegiatan
  for select using (
    lpj_id in (
      select l.id from lpj l
      where l.proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
    )
  );

drop policy if exists lkpka_mpm_select_all_dokumentasi on public.dokumentasi_kegiatan;
create policy lkpka_mpm_select_all_dokumentasi on public.dokumentasi_kegiatan
  for select using (get_user_role() in ('lkpka', 'mpm'));

-- insert: ORMAWA pemilik
drop policy if exists ormawa_insert_own_dokumentasi on public.dokumentasi_kegiatan;
create policy ormawa_insert_own_dokumentasi on public.dokumentasi_kegiatan
  for insert to authenticated with check (
    get_user_role() = 'ormawa'
    and lpj_id in (
      select l.id from lpj l
      where l.proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
    )
  );

-- update/delete: TIDAK ADA

-- ============ ACTIVITY_LOGS ============
-- select: MPM semua; ORMAWA/LKPKA hanya log miliknya sendiri
drop policy if exists mpm_select_all_activity_logs on public.activity_logs;
create policy mpm_select_all_activity_logs on public.activity_logs
  for select using (get_user_role() = 'mpm');

drop policy if exists actor_select_own_activity_logs on public.activity_logs;
create policy actor_select_own_activity_logs on public.activity_logs
  for select using (actor_id = auth.uid());

-- ORMAWA: log miliknya sendiri + log proposal/LPJ milik organisasinya
-- (agar riwayat/timeline proposal tetap lengkap saat RLS select aktif)
drop policy if exists ormawa_select_related_activity_logs on public.activity_logs;
create policy ormawa_select_related_activity_logs on public.activity_logs
  for select using (
    get_user_role() = 'ormawa'
    and (
      actor_id = auth.uid()
      or (
        target_table = 'proposals'
        and target_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
      )
      or (
        target_table = 'lpj'
        and target_id in (
          select l.id from lpj l
          where l.proposal_id in (select id from proposals where ormawa_id = get_user_ormawa_id())
        )
      )
    )
  );

-- insert: siapa saja yang terautentikasi (via server action)
drop policy if exists authenticated_insert_activity_logs on public.activity_logs;
create policy authenticated_insert_activity_logs on public.activity_logs
  for insert to authenticated with check (true);

-- update/delete: TIDAK ADA untuk role manapun, termasuk mpm
-- ============ STORAGE: dokumentasi-kegiatan + logo ============
-- read: publik (bucket public).
drop policy if exists dokumentasi_public_read on storage.objects;
create policy dokumentasi_public_read on storage.objects
  for select using (bucket_id = 'dokumentasi-kegiatan');

drop policy if exists logo_public_read on storage.objects;
create policy logo_public_read on storage.objects
  for select using (bucket_id = 'logo');

drop policy if exists dokumentasi_auth_write on storage.objects;
drop policy if exists dokumentasi_own_write on storage.objects;
drop policy if exists logo_own_write on storage.objects;
drop policy if exists storage_own_write on storage.objects;
create policy storage_own_write on storage.objects
  for insert to authenticated with check (
    (bucket_id = 'logo' and (storage.foldername(name))[1] = auth.uid()::text)
    or
    (bucket_id = 'dokumentasi-kegiatan' and (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists dokumentasi_auth_update on storage.objects;
drop policy if exists dokumentasi_own_update on storage.objects;
drop policy if exists logo_own_update on storage.objects;
drop policy if exists storage_own_update on storage.objects;
create policy storage_own_update on storage.objects
  for update to authenticated using (
    (bucket_id = 'logo' and (storage.foldername(name))[1] = auth.uid()::text)
    or
    (bucket_id = 'dokumentasi-kegiatan' and (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists dokumentasi_auth_delete on storage.objects;
drop policy if exists dokumentasi_own_delete on storage.objects;
drop policy if exists logo_own_delete on storage.objects;
drop policy if exists storage_own_delete on storage.objects;
create policy storage_own_delete on storage.objects
  for delete to authenticated using (
    (bucket_id = 'logo' and (storage.foldername(name))[1] = auth.uid()::text)
    or
    (bucket_id = 'dokumentasi-kegiatan' and (storage.foldername(name))[1] = auth.uid()::text)
  );
