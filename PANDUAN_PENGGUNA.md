# PANDUAN_PENGGUNA — ANGGARA

Sistem penganggaran kegiatan ORMAWA Universitas Adzkia. Alur: ORMAWA ajukan proposal → LKPKA review & tetapkan anggaran → ORMAWA laksanakan → ORMAWA kirim LPJ → MPM awasi read-only.

Akses: login di halaman utama dengan akun yang dibuat MPM. Ketiga role memakai halaman yang sama (`/login`); menu menyesuaikan role.

---

## 1. MPM (Majelis Permusyawaratan Mahasiswa)

Tugas MPM: mengawasi seluruh proses secara transparan (read-only) + mengelola akun ORMAWA.

### Yang bisa dilakukan
- **Ringkasan** (`/mpm/dashboard`) — anggaran disetujui bulan ini, total proposal, ormawa aktif, kegiatan selesai, grafik anggaran per ormawa dan proposal per status.
- **Proposal** (`/mpm/proposals`) — melihat semua proposal semua ormawa beserta filter status/ormawa/tanggal. Baca-saja, tidak bisa menyetujui/menolak.
- **LPJ** (`/mpm/lpj`) — galeri LPJ yang sudah dikirim ormawa: ringkasan dana, rincian pengeluaran, selisih realisasi vs anggaran, dokumentasi, dan PDF LPJ.
- **Ormawa** (`/mpm/ormawa`) — daftar ormawa, membuat akun ormawa baru (nama, jenis, email, password sementara), dan mengaktifkan/menonaktifkan ormawa. Akun baru langsung bisa login.
- **Log aktivitas** (`/mpm/activity-log`) — riwayat lengkap semua aksi penting (pengajuan, review, perubahan status otomatis). Tidak bisa diubah/dihapus siapa pun.

### Catatan
- Setiap aksi ormawa/lkpka tercatat otomatis di log aktivitas.
- Jika ormawa nonaktif, anggotanya tidak bisa mengajukan proposal baru.

---

## 2. LKPKA (Lembaga Kemahasiswaan dan Pengembangan Karakter)

Tugas LKPKA: menilai proposal, menetapkan anggaran, dan memeriksa LPJ.

### Alur kerja harian
1. **Proposal** (`/lkpka/proposals`) — lihat daftar proposal; badge merah menunjukkan jumlah yang menunggu review (`diajukan`).
2. Buka proposal → **Setujui** (masukkan nominal anggaran disetujui), **Minta revisi** (isi catatan; ormawa harus perbaiki dan kirim ulang), atau **Tolak** (isi alasan minimal 20 karakter).
3. Saat kegiatan berjalan, sistem otomatis memindahkan status (mulai → menunggu LPJ) berdasarkan tanggal kegiatan.
4. **Tracking LPJ** (`/lkpka/lpj`) — daftar proposal yang wajib lapor LPJ, termasuk yang terlambat.
5. Buka LPJ → **Setujui** (kegiatan selesai) atau **Minta revisi** (isi catatan; ormawa memperbaiki dan kirim ulang).

### Catatan
- Anggaran disetujui hanya bisa ditetapkan saat menyetujui proposal.
- Kegiatan dinyatakan selesai hanya setelah LPJ disetujui.

---

## 3. ORMAWA

Tugas ORMAWA: mengajukan proposal, melaksanakan kegiatan, dan melaporkan pertanggungjawaban (LPJ).

### Alur kerja harian
1. **Ringkasan** (`/ormawa/dashboard`) — statistik proposal milik ormawa; badge menunjukkan proposal yang perlu revisi dan LPJ yang sudah jatuh tempo. Di sini juga bisa mengunggah logo ormawa.
2. **Ajukan proposal** (`/ormawa/proposals/baru`) — isi judul, deskripsi, tujuan, tanggal pelaksanaan, lokasi, dan anggaran yang diajukan (Rupiah, tanpa titik). PDF pendukung bersifat opsional.
3. **Pantau status** (`/ormawa/proposals`) — setiap perubahan status terlihat di sini.
4. Jika LKPKA **minta revisi**: buka proposal → **Ajukan revisi** → perbaiki isi → kirim ulang (versi revisi bertambah otomatis).
5. Jika proposal **ditolak**: pelajari alasan penolakan; buat proposal baru bila ingin mengajukan ulang.
6. Setelah kegiatan selesai, sistem menandai proposal **menunggu LPJ**. Buka proposal → isi **LPJ**: ringkasan penggunaan dana, rincian pengeluaran (item + jumlah + keterangan), unggah PDF LPJ (opsional) dan dokumentasi foto/video.
7. Jika LKPKA **minta revisi LPJ**: buka proposal → mode edit LPJ (data lama terisi otomatis, ganti dokumen bila perlu) → kirim ulang.

### Aturan penting
- Proposal hanya bisa diubah saat status `draft` atau `revisi_diminta`; LPJ hanya saat `menunggu` atau `revisi_diminta`.
- Anggaran yang diajukan ≠ anggaran disetujui; selisih realisasi LPJ vs anggaran disetujui terlihat di galeri MPM.
- Login/logout: tombol **Keluar** di pojok kanan atas.

---

## Pertanyaan umum

- **Lupa password?** Hubungi MPM untuk reset/membuat akun baru (akun dibuat manual oleh MPM).
- **Situs diakses dari HP?** Ya — seluruh halaman dirancang mobile-first.
- **Data hilang jika browser ditutup?** Tidak — semua tersimpan di database server; sesi login tetap aman.