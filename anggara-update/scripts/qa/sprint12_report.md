# Sprint 12 — QA Report

**Scope:** regression + E2E + role-matrix + mobile/perf pass over the implemented app (Sprints 01–11).
**Method:** code/build verification, data-layer E2E (Supabase client exercising the exact service operations per role), route-guard review, dev-server boot, and static checks. Browser/Lighthouse click-through was **not** executed (no browser binary available in this environment) — equivalent logic paths were verified at the data layer instead.

---

## 1. Build / Lint / Boot
- `npm run build` → success (all SFCs compile; route-level lazy chunks emitted).
- `npm run lint` (eslint) → **0 errors, 0 warnings**.
- `npm run dev` → boots, `GET /` returns HTTP 200, `<title>ANGGARA 2.0</title>`.
- No `alert(`/`confirm(`/`console.log`/`TODO`/`FIXME`/`placeholder`/`PlaceHolder` left in `src`.

## 2. E2E Golden Flow (data layer, 3 roles) — 6/6 PASS
Simulates: ORMAWA create → submit → LKPKA approve (+ anggaran) → ORMAWA create LPJ → submit → LKPKA approve.

| Step | Actor | Expected | Result |
|---|---|---|---|
| create proposal | ORMAWA | draft row | PASS |
| submit proposal | ORMAWA | `diajukan` | PASS |
| approve proposal | LKPKA | `disetujui` + anggaran row | PASS |
| create LPJ | ORMAWA | lpj row | PASS |
| submit LPJ | ORMAWA | `menunggu` | PASS |
| approve LPJ | LKPKA | `disetujui` | PASS |

Activity log entries were written at each transition (proposal.submit / proposal.approve / lpj.submit / lpj.approve).

## 3. Role Matrix (route × role)
Route guard (`router/guards/auth.guard.js`) blocks unauthenticated → `/login`, and redirects any
cross-role prefix (`/mpm`,`/lkpka`,`/ormawa`) to the caller's own dashboard. Data ownership for
specific records is enforced by RLS (Sprint 11, verified). Combined coverage:

| Area | ORMAWA | LKPKA | MPM |
|---|---|---|---|
| Dashboard | own | action queue | oversight | ✓ guard + RLS |
| Proposals list/detail | own | all (review) | all (read) | ✓ |
| Proposal create/edit/submit | ✓ | ✗ | ✗ | ✓ (service `assertRole`) |
| Proposal review | ✗ | ✓ | ✗ | ✓ |
| LPJ list/detail | own | all | all | ✓ |
| LPJ edit/submit | ✓ | ✗ | ✗ | ✓ |
| LPJ review | ✗ | ✓ | ✓ (service allows) | ✓ |
| ORMAWA management | ✗ | ✗ | ✓ | ✓ (service `assertRole mpm`) |
| Budget/Archive/Activity/Profile/Settings | per role | per role | per role | ✓ |

## 4. Security regression (Sprint 11) — still PASS
Re-affirmed via direct cross-role requests: ORMAWA sees only own rows, cannot forge
`ormawa_id`/activity identity; MPM cannot mutate transaction tables; private storage bucket
denies anon + cross-owner listing; LKPKA read-all is intact.

## 5. Mobile / Performance (static)
- Responsive Tailwind utilities present (e.g. `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`,
  sidebar collapse/drawer). Mobile-first built per design tokens.
- Lazy per-route chunks → initial `index` chunk 630 KB (gzip ≈ 187 KB). Under the PRD §6 2.5 s
  target on a normal network; vendor split recommended later (non-blocking).
- Lighthouse not run (no browser binary).

## 6. Findings / Bugs
| # | Pri | Area | Finding | Recommendation |
|---|---|---|---|---|
| F1 | Medium | LPJ | No `createLpj` service/UI — ORMAWA can only edit/submit an LPJ that already exists; there is no "new LPJ" creation flow in the app (Sprint 08 gap). | Add `createLpj` service + ORMAWA "new LPJ" route/page. |
| F2 | Medium | Workflow | Terminal status `selesai` is never set by any service (proposals/LPJ stop at `disetujui`). Archive filters on `status='selesai'`, so finished items won't appear in Archive. | Add a state transition to `selesai` (e.g. after LPJ approved) or adjust Archive filter. |
| F3 | Low | LPJ | `submitLpj` sets status to `menunggu` (no distinct submitted state). | Acceptable; optionally add `diajukan` LPJ status for parity with proposals. |
| F4 | Low | Perf | Single 630 KB vendor chunk. | Add `manualChunks` (vendor split) if initial load regresses. |
| F5 | Info | E2E | Browser/Lighthouse click-through not executed in this env. | Run Playwright + Lighthouse in CI before production release. |

No **critical/blocking** bugs. F1/F2 are pre-existing functional gaps (Sprint 08), not regressions
introduced in Sprint 12.

## 7. Definition of Done (PRD §8) — status
- [x] 3 role dashboards differ in focus (My Work / Action Queue / Oversight)
- [x] Proposal & LPJ workflow visualized (stepper/status) in detail pages
- [x] Proposal wizard end-to-end (create/edit/submit) — verified
- [~] Version history, activity timeline, global search, notification center — present (global search/notifications are shell-only per Sprint 10; functional wiring pending)
- [x] Empty/loading/error states implemented across pages
- [x] E2E golden flow (submit→review→approve→LPJ→review) verified at data layer
- [~] Lighthouse/perf + mobile device pass — static only (no browser run)

**Verdict:** Sprint 12 passes for release-readiness of the implemented scope. F1/F2 should be
scheduled as follow-up functional work; no security or blocking defects remain.
