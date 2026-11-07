# Argandhi. (Folioblox) — Design System & Style Guide

Dokumen ini adalah **patokan desain utama (*Single Source of Truth*)** untuk seluruh tampilan publik portofolio **Faqih Rafasha Argandhi (`Argandhi.`)**. Setiap pengembangan section maupun halaman (`/`, `/about`, `/projects`, `/projects/[slug]`) **WAJIB** mengacu pada dokumen ini agar identitas visual tetap konsisten, bersih, dan bebas dari klise desain generator AI.

---

## 1. Filosofi Desain & Identitas Personal

- **Identitas Pemilik:** **Faqih Rafasha Argandhi (`Argandhi.`)** — Mahasiswa S1 Teknik Informatika UNESA ('24), Cohort AI Engineer Asah (Dicoding & GoTo), & *Full-Stack / Software Developer* (Surabaya, Indonesia) yang berfokus pada Web Modern (Next.js & Supabase), Mobile App (Flutter APK), serta Sistem AI.
- **Tema Utama:** *Minimalist Editorial Dark & Warm Cream Contrast* — Perpaduan kontras antara ruang hitam obsidian (`#080808`), aksen merah marun menyala (*Crimson-Burgundy* `#9E1B32` / `#E04D70`), dan kanvas editorial krem hangat (`#F5F0EB`) pada section *About*.
- **Prinsip Anti-AI-Cliché (Wajib Dipatuhi):**
  - **DILARANG** menggunakan ornamen *sci-fi HUD* palsu, *pill badge* berlebihan, *browser window traffic lights* palsu, *glowing blur blobs* di setiap sudut, atau kartu kotak berulang yang monoton.
  - Gunakan **tipografi kontras tinggi**, **ruang kosong (*whitespace*) lega**, **garis pembatas tipis (`1px` hairline)**, dan pemisah teks sederhana (`/` atau `—`).

---

## 2. Palet Warna (Color Palette)

### A. Warna Latar (Backgrounds & Surfaces)
| Nama Token | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `--bg-primary-obsidian` | `#080808` | Latar belakang utama halaman gelap (*Projects*, *Contact*, & halaman lanjutan). |
| `--bg-secondary-obsidian` | `#0B0B0B` / `#121212` | Latar belakang variasi section gelap (*Services*) dan kontainer gambar. |
| `--bg-editorial-cream` | `#F5F0EB` | Latar belakang khusus section *About & Education* yang terbuka dari *Hero Eye Portal*. |
| `--bg-surface-card` | `#131313` | Permukaan panel minimalis (seperti form kontak atau *backplate* parallax). |

### B. Warna Aksen & Gradien (Accents & Gradients)
| Nama Token | Nilai Warna / Hex | Penggunaan |
| :--- | :--- | :--- |
| `--accent-crimson` | `#9E1B32` | Warna utama brand (*eyebrow*, indeks nomor `01–04`, tombol Pill CTA, kartu aksen parallax `#px-layer-fast`). |
| `--accent-rose` | `#E04D70` | Warna sorotan *hover* teks dan aksen aktif. |
| `--hero-glow-gradient` | `radial-gradient(...)` Crimson-Burgundy ke Obsidian | Gradien atmosferik pada *Hero Section*, *Compact Hero*, dan *Bookend Footer*. |

### C. Warna Tipografi & Garis (Text & Borders)
| Nama Token | Nilai Warna / Hex | Penggunaan |
| :--- | :--- | :--- |
| `--text-on-dark` | `#FFFFFF` | Judul utama (H1, H2, H3) dan teks primer di atas latar `#080808`. |
| `--text-muted-on-dark` | `rgba(255, 255, 255, 0.65)` | Paragraf deskripsi dan ringkasan proyek di atas latar gelap. |
| `--text-on-cream` | `#0D0D0D` | Teks utama di atas latar krem `#F5F0EB`. |
| `--text-muted-on-cream` | `#57504A` | Teks sekunder di atas latar krem `#F5F0EB`. |
| `--border-hairline-dark` | `rgba(255, 255, 255, 0.12)` | Garis pembatas tipis (*hairline*) antar baris di atas latar gelap. |
| `--border-hairline-cream` | `rgba(13, 13, 13, 0.14)` | Garis pembatas tipis (*hairline*) antar baris di atas latar krem. |

---

## 3. Sistem Tipografi & Animasi Teks (`GsapSplitText`)

- **Font Utama:** `Plus Jakarta Sans` untuk judul/body & `Geist Mono` (`font-mono`) untuk indeks angka (`01`, `02`) serta daftar teknologi (`Next.js / Supabase / Flutter`).
- **Standar Animasi Teks (`src/components/motion/GsapSplitText.tsx`):**
  - Seluruh judul section (`SectionHeader`), subjudul, dan deskripsi utama dipecah per kata di dalam pembungkus `overflow-hidden` dan dianimasikan naik (`yPercent: 110 -> 0`, `rotateZ: 2deg -> 0deg`, `stagger: 0.03s`) menggunakan **GSAP `ScrollTrigger`**.
  - Mendukung penuh sistem dwibahasa (`EN` / `ID`) melalui komponen `<T>` dan `<CmsText>` tanpa konflik manipulasi DOM React.

---

## 4. Koreografi Animasi Landing Page (`/` — Zero Monotony)

Setiap section pada halaman utama memiliki koreografi **GSAP + ScrollTrigger** yang berbeda agar alur cerita terasa hidup seperti situs *Awwwards Site of the Day*:

1. **Section 1 & 2 — Hero 3D Bust & Eye Portal (`HeroEyePortal.tsx`):**
   - **Phase 1 (Scroll-Scrubbed):** Karakter 3D di tengah Hero menoleh dari profil samping ke arah depan seiring scroll, sementara elemen UI Hero memudar dan kedua mata menyala putih tajam.
   - **Phase 2 (One-Shot Eye Dive):** Kamera meluncur masuk ke mata kanan karakter dan membuka ruang **Warm Editorial Cream (`#F5F0EB`)** untuk section *About & Education*.
   - Di dalam section krem terdapat teks manifesto (`LocalizedScrollTextReveal`) dan daftar riwayat pendidikan minimalis (`EditorialIdentityCards.tsx`) dengan garis pembatas yang memanjang otomatis (`scaleX: 0 -> 1`).

2. **Transisi Keluar Halaman Putih (`WhiteToDarkPortalBridge.tsx`):**
   - Di penghujung section `#F5F0EB`, panel hitam `#080808` membesar secara mulus dari bingkai `clip-path: inset(18% 14% 18% 14% round 48px)` menjadi layar penuh `inset(0% 0% 0% 0% round 0px)` menggunakan GSAP `ScrollTrigger` (`scrub: 0.4`).

3. **Section 3 — Featured Projects: GSAP Horizontal Scroll (`GsapProjectsStage.tsx` & `SelectedWorksSection.tsx`):**
   - `SectionHeader` ditempatkan statis di atas panggung agar tidak pernah bertabrakan dengan *floating navbar*.
   - Panggung galeri proyek dikunci (`pin: true` pada desktop) dan menggeser deretan proyek **ke samping kiri (`x: -maxScroll`, `scrub: 0.6`)** saat pengunjung melakukan scroll ke bawah.
   - Setiap proyek tampil bersih tanpa *badge* atau *browser bar* palsu: gambar ber-rasio `16:10` dengan *inner horizontal parallax* (`scale(1.08) translate3d(...)`) dan blok teks editorial di bawahnya yang proporsional (tidak pernah terpotong di bagian bawah layar).

4. **Section 4 — Services: Minimalist Editorial Index (`ServicesProcessSection.tsx`):**
   - Baris layanan editorial penuh 12 kolom (`01` s/d `04`) dengan animasi teks `GsapSplitText`, garis pembatas `scaleX: 0 -> 1` saat di-scroll, dan daftar teknologi sederhana (`Next.js / Supabase / Admin CMS`).

5. **Section 5 — Contact & Bookend Footer (`GsapContactCockpit.tsx` & `FooterBookend.tsx`):**
   - Kolom kiri menampilkan formulir pesan (`ContactForm`), sedangkan kolom kanan menampilkan direktori kontak minimalis (`01 / WHATSAPP`, `02 / EMAIL`, `03 / GITHUB`) berbatas garis tipis tanpa kotak kartu berlebih.
   - Ditutup dengan `<FooterCurtain />`, animasi per karakter pada judul raksasa `Let's Talk.`, serta efek *Magnetic Cursor Pull* pada tombol `Get in touch`.

---

## 5. Standar Performa & Aksesibilitas Motion (`src/components/motion/`)

1. **Sinkronisasi Lenis + GSAP (`SmoothScrollProvider.tsx`):**
   - Instance `Lenis` memanggil `ScrollTrigger.update()` pada setiap frame scroll dan memicu `ScrollTrigger.refresh()` setiap kali fase `HeroEyePortal` berubah (`hero-portal-change`) atau rute berpindah.
2. **Dukungan `prefers-reduced-motion`:**
   - Seluruh komponen animasi wajib memeriksa `(prefers-reduced-motion: reduce)` atau menggunakan `gsap.matchMedia()` sehingga pengguna dengan preferensi gerak minimal tetap dapat mengakses seluruh konten dengan `opacity: 1` dan `transform: none`.
