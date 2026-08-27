# DESIGN.md — ANGGARA 2.0 Design System

> Sumber kebenaran visual untuk implementasi. Semua komponen Vue harus konsisten dengan token & prinsip di sini. Dibaca bersama `AGENTS.md` (aturan kode) dan `PRD.md` (requirement fungsional).

## 1. Konsep Produk

**"Modern Institutional SaaS"** — referensi visual: Linear + Notion + Modern Banking Dashboard + University Institutional System.

Karakter: clean, profesional, modern, trustworthy, sedikit premium, information-dense tapi tidak sesak, animasi subtle tapi hidup.

**Hindari:** bootstrap admin template look, dashboard penuh card tanpa hierarki, gradient berlebihan, neon, glassmorphism di mana-mana, animasi berlebihan.

## 2. 7 Prinsip UX Inti

1. **Action first** — user harus langsung tahu "apa yang harus saya lakukan sekarang".
2. **Workflow visible** — status selalu divisualisasikan sebagai stepper/timeline (✓ ✓ ✓ ● ○ ○), bukan sekadar teks "Approved".
3. **Progressive disclosure** — Summary → Details → Documents → History, jangan tumpahkan semua info sekaligus.
4. **Contextual action** — tombol yang muncul sesuai konteks saat itu (mis. saat status "Revisi", tampilkan hanya "Lihat Catatan" + "Edit Proposal"), bukan 10 tombol sekaligus.
5. **Prevent mistakes** — checklist validasi sebelum submit (info lengkap, anggaran valid, dokumen ada, tidak ada field kosong).
6. **Feedback immediately** — setiap aksi: click → loading → success → UI update.
7. **Mobile capable** — khususnya alur ORMAWA, approval/review, dan monitoring harus nyaman di tablet/mobile.

## 3. Typography

Font: **Plus Jakarta Sans**

| Level   | Size    | Weight |
| ------- | ------- | ------ |
| Display | 32–40px | 700    |
| H1      | 28–32px | 700    |
| H2      | 22–24px | 700    |
| H3      | 18–20px | 600    |
| Body    | 14–16px | 400    |
| Small   | 12–13px | 400    |
| Label   | 12–14px | 600    |

## 4. Color Tokens

```css
--color-primary: #1e3a8a;
--color-primary-hover: #1d4ed8;
--color-primary-soft: #eff6ff;

--color-background: #f8fafc;
--color-surface: #ffffff;
--color-surface-secondary: #f1f5f9;

--color-text: #0f172a;
--color-text-secondary: #475569;
--color-text-muted: #64748b;

--color-border: #e2e8f0;

--color-success: #16a34a;
--color-success-soft: #f0fdf4;
--color-warning: #f59e0b;
--color-warning-soft: #fffbeb;
--color-danger: #dc2626;
--color-danger-soft: #fef2f2;
```

## 5. Status System

Status tidak pernah color-only — selalu ada indikator bentuk (●) + label teks.

| Status (DB value)      | UI Color | Label                |
| ---------------------- | -------- | -------------------- |
| `draft`                | Neutral  | Draft                |
| `diajukan`             | Blue     | Diajukan             |
| `revisi_diminta`       | Amber    | Revisi Diminta       |
| `ditolak`              | Red      | Ditolak              |
| `disetujui`            | Green    | Disetujui            |
| `kegiatan_berlangsung` | Violet   | Kegiatan Berlangsung |
| `lpj_menunggu`         | Amber    | LPJ Menunggu         |
| `lpj_direview`         | Blue     | LPJ Direview         |
| `selesai`              | Green    | Selesai              |

## 6. Spacing

Base scale: `4 8 12 16 20 24 32 40 48 64` (px)

Page padding: Desktop 32px · Tablet 24px · Mobile 16px

## 7. Card System

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 16px;
padding: 20px–24px;
box-shadow: var(--shadow-sm); /* sangat subtle, jangan shadow besar di semua card */
```

## 8. Button System

- **Primary** — aksi utama halaman (mis. "Ajukan Proposal")
- **Secondary** — aksi sekunder (mis. "Simpan Draft")
- **Ghost** — aksi tersier/navigasi ringan (mis. "Lihat Detail")
- **Danger** — aksi destruktif (mis. "Tolak Proposal")
- **Icon action** — `[•••]` untuk menu kontekstual

Microinteraction tombol: `Normal → [⟳ Approving...] → [✓ Approved]` lalu status ter-update di UI.

## 9. Form Design

- Label selalu di atas input, tidak pernah mengandalkan placeholder sebagai label.
- Tandai field required secara eksplisit.
- Error: label + border merah + pesan `⚠ ...` di bawah field.
- Success: indikator `✓ Valid`.

## 10. Table Design

- Desktop: tabel standar dengan header sticky opsional.
- Mobile: setiap row berubah jadi card (judul, badge status, info kunci, tombol View).

## 11. Layout & Navigation

### Application Shell (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ LOGO   Search...              🔔  Help  Avatar               │
├──────────────┬───────────────────────────────────────────────┤
│ Dashboard    │                                               │
│ WORKFLOW     │              PAGE CONTENT                     │
│ Proposals    │                                               │
│ LPJ          │                                               │
│ MONITORING   │                                               │
│ Budget       │                                               │
│ Reports      │                                               │
│ SYSTEM       │                                               │
│ Archive      │                                               │
│ Settings     │                                               │
│ ─────────    │                                               │
│ User         │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

- Sidebar: desktop 248px, collapsed 72px, mobile = drawer/sheet.
- Topbar: sidebar toggle, breadcrumb, global search, notification, profile menu.

### Global Search (Ctrl+K)

Mencari: proposal, LPJ, ORMAWA, activity, nomor proposal. Hasil dikelompokkan per kategori + section "Actions" (mis. "Create Proposal").

## 12. Responsive Breakpoints

| Breakpoint | Range       |
| ---------- | ----------- |
| Mobile     | < 640px     |
| Tablet     | 640–1024px  |
| Desktop    | 1024–1440px |
| Large      | > 1440px    |

Sidebar: fixed (desktop) → collapsed (tablet) → drawer (mobile).

## 13. Animation Spec

| Elemen            | Spec                                              |
| ----------------- | ------------------------------------------------- |
| Page transition   | opacity 0→1, translateY 4px→0, 180ms              |
| Modal             | opacity 0→1, scale .98→1, 180ms                   |
| Sidebar collapse  | width 248px→72px, 220ms                           |
| Card hover        | translateY 0→-1px, sangat subtle                  |
| Workflow progress | garis progress bergerak antar step, 400–600ms     |
| Upload            | progress bar real-time hingga "✓ Upload complete" |
| Form autosave     | "Saving..." → "✓ Saved HH:mm"                     |

## 14. Loading, Empty & Error States

- **Loading**: selalu skeleton (dashboard, table, detail) — tidak pernah blank screen.
- **Empty**: ikon + pesan spesifik + CTA (mis. "Belum ada proposal" + "[+ Buat Proposal]"), bukan teks "No data".
- **Error**: pesan spesifik + tombol retry (mis. "Data proposal tidak dapat dimuat" / "Koneksi bermasalah" untuk network error).

## 15. Toast System

Tiga tipe: Success (`✓ ...`), Error (`! ... + Coba lagi`), Warning (`! ...`). Selalu singkat, satu baris utama.

## 16. Confirmation UX

Untuk aksi destruktif (Reject/Tolak): dialog wajib menampilkan target, peringatan "tidak dapat dibatalkan", field alasan wajib diisi, tombol Batal vs Danger action — tidak boleh bisa ke-klik tidak sengaja.

## 17. Role-Based Dashboard Differentiation

| Role   | Dashboard Fokus                                              |
| ------ | ------------------------------------------------------------ |
| ORMAWA | **MY WORK** — proposal, deadline, revision, LPJ              |
| LKPKA  | **ACTION QUEUE** — review, approval, revision, tracking      |
| MPM    | **OVERSIGHT** — financial overview, ORMAWA, trends, activity |

## 18. Component Inventory

**UI primitives:** Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Badge, Avatar, Separator, Tooltip, Popover, Dropdown, Dialog, Sheet, Tabs, Accordion, Calendar, DatePicker

**Data components:** DataTable, Pagination, FilterBar, SearchInput, EmptyState, ErrorState, Skeleton, StatCard, MetricCard, ProgressBar, ChartCard, Timeline, ActivityItem, StatusBadge

**Workflow components:** WorkflowTimeline, WorkflowStepper, WorkflowStatus, ActionQueue, ActionCard, ReviewPanel, ReviewAction, ApprovalDialog, RevisionDialog, RejectionDialog

**Proposal components:** ProposalCard, ProposalTable, ProposalDetail, ProposalHeader, ProposalSummary, ProposalTimeline, ProposalBudget, ProposalDocuments, ProposalHistory, ProposalWizard, ProposalStep, ProposalReview, RevisionNotice, VersionHistory, VersionCompare

**Budget components:** BudgetSummary, BudgetTable, BudgetItem, BudgetBuilder, BudgetBreakdown, BudgetComparison, BudgetChart, BudgetProgress

**LPJ components:** LpjCard, LpjDetail, LpjForm, LpjWizard, LpjSummary, LpjExpenseTable, LpjReview, LpjStatus, RealizationChart

**File components:** FileUploader, FilePreview, PdfPreview, DocumentCard, DocumentList, ImageGallery, ImageLightbox, UploadProgress

**Navigation components:** AppShell, Sidebar, SidebarItem, Topbar, Breadcrumb, UserMenu, NotificationCenter, GlobalSearch, CommandPalette, MobileNavigation

## 19. Accessibility (WCAG AA minimum)

Wajib: keyboard navigation penuh, visible focus ring, kontras cukup, aria-label pada semua icon-only action, semantic HTML, error terhubung ke field via `aria-describedby`, modal punya focus trap, Escape menutup modal, tidak ada status yang hanya mengandalkan warna.

## 20. Design Token CSS (struktur final)

```css
--color-primary
--color-primary-soft
--color-background
--color-surface
--color-text
--color-text-muted
--color-border
--color-success
--color-warning
--color-danger
--radius-sm --radius-md --radius-lg --radius-xl
--shadow-sm --shadow-md
--spacing-1 --spacing-2 ... /* skala di §6 */
```
