# Argandhi. (Folioblox) — Design System & Style Guide

Dokumen ini adalah **patokan desain utama (*Single Source of Truth*)** untuk seluruh tampilan publik portofolio **Faqih Rafasha Argandhi (`Argandhi.`)**. Setiap pengembangan section baru (seperti *Selected Works*, *Services & Process*, *Testimonials*, *FAQ*, *Footer*) maupun halaman lanjutan (`/about`, `/projects`, `/projects/[slug]`, `/contact`) **WAJIB** mengacu pada dokumen ini agar identitas visual tetap konsisten 100%.

---

## 1. Filosofi Desain & Identitas Personal

- **Identitas Pemilik:** **Faqih Rafasha Argandhi (`Argandhi.`)** — Mahasiswa S1 Teknik Informatika UNESA ('24) & *Freelance Full-Stack / Software Developer* (Surabaya, Indonesia) yang berfokus pada pengembangan Web Modern (Next.js & Supabase), Mobile App (Flutter APK), serta Integrasi Sistem AI.
- **Tema Utama:** *Warm Futuristic Dark Mode* — Perpaduan antara latar belakang hitam pekat (*obsidian/charcoal* `#080808`) dengan pencahayaan dramatis berwarna oranye-merah menyala (*fiery sunset glow*).
- **Karakter Visual:** Berani (*bold*), bersih, berfokus pada tipografi kontras tinggi, serta memadukan siluet atmosferik hangat di bagian atas (*Hero*) dengan visual editorial hitam-putih (*monochrome*) bertekstur tajam di bagian konten.
- **Ciri Khas Bentuk (*Shape Language*):** Penggunaan sudut membulat besar (*large rounded corners* `36px` – `42px`) untuk memisahkan antar-section secara berlapis (*layered card stacking*), serta tombol berbentuk kapsul penuh (*pill buttons*).

---

## 2. Palet Warna (Color Palette)

### A. Warna Latar (Backgrounds & Surfaces)
| Nama Token | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `--bg-canvas-outer` | `#3A1708` s/d `#0D0806` | Gradien latar belakang presentasi luar (opsional untuk tampilan mockup). |
| `--bg-primary-black` | `#080808` | Latar belakang utama halaman (section *Behind the Code*, *Selected Works*, & ke bawah). |
| `--bg-surface-elevated` | `#121212` | Latar belakang layer tumpukan sekunder (bar *Tech Stack / Brands*, kontainer *Services*, kartu utama). |
| `--bg-surface-card` | `#181818` | Latar belakang kartu proyek/fitur/form di dalam surface gelap. |

### B. Warna Aksen & Gradien (Accents & Gradients)
| Nama Token | Nilai Warna / Hex | Penggunaan |
| :--- | :--- | :--- |
| `--accent-orange` | `#FF5510` | Warna utama brand (tanda `#`, *eyebrow text*, tombol Pill CTA kedua, lingkaran panah). |
| `--accent-orange-hover` | `#FF6B2B` | Warna *hover* pada elemen interaktif oranye. |
| `--hero-glow-gradient` | `radial-gradient(circle at 26% 24%, #FF6B24 0%, #F43E0B 30%, #9E1B06 62%, #2B0804 92%, #170503 100%)` | Gradien dramatis pada latar belakang *Hero Section*, *Compact Hero*, dan *Bookend Footer*. |

### C. Warna Tipografi & Garis (Text & Borders)
| Nama Token | Nilai Warna / Hex | Penggunaan |
| :--- | :--- | :--- |
| `--text-primary` | `#FFFFFF` | Judul utama (H1, H2, H3), teks navigasi aktif, dan *lead paragraph*. |
| `--text-secondary` | `rgba(255, 255, 255, 0.72)` | Paragraf deskripsi di dalam *Hero* dan sub-item. |
| `--text-muted` | `#7A7A7A` | Teks pendukung kecil (contoh: *"Let's Build Something Meaningful Together"*). |
| `--border-subtle` | `rgba(255, 255, 255, 0.07)` | Garis tepi halus pada bagian bawah section melengkung atau kartu gelap. |

---

## 3. Sistem Tipografi (Typography)

- **Font Utama (Primary Font):** `Plus Jakarta Sans` (Sans-serif geometris modern dengan *x-height* tinggi dan kerapatan huruf yang rapi).
- **Karakteristik:** Judul berukuran besar menggunakan *letter-spacing* rapat (`-0.03em` hingga `-0.04em`) dan *line-height* padat (`0.93` hingga `1.12`).

### Skala Tipografi (Desktop)
| Elemen | Ukuran (`rem` / `px`) | Ketebalan (`font-weight`) | Line Height | Tracking (`letter-spacing`) |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display (`H1`)** | `5.25rem` (`84px`) | `700` (Bold) / `800` | `0.94` | `-0.04em` |
| **Section Heading (`H2`)** | `2.875rem` (`46px`) | `700` (Bold) | `1.10` | `-0.03em` |
| **Hero Subtitle / Intro** | `1.5rem` (`24px`) | `600` – `700` | `1.25` | `-0.02em` |
| **Lead Paragraph** | `1.35rem` (`21.6px`) | `600` (SemiBold) | `1.38` | `-0.015em` |
| **Eyebrow Label** | `1.125rem` (`18px`) | `600` (SemiBold) | `1.30` | `-0.01em` |
| **Body / Service Title** | `0.875rem` (`14px`) | `400` – `500` | `1.50` | `0em` |
| **Micro Label** | `0.75rem` (`12px`) | `500` – `600` | `1.35` | `0.01em` |

---

## 4. Layout, Grid & Spacing

1. **Container Utama:**
   - Lebar maksimum (*Max-width*): `1140px` (`max-w-[1140px]`) dengan *padding* horizontal `48px` (`sm:px-12`) pada Desktop dan `24px` (`px-6`) pada Mobile.
2. **Efek Tumpukan Kartu Melengkung (*Stacked Rounded Sections*):**
   - Section **Hero** (`.hero-card`) memiliki `border-radius: 0 0 42px 42px` dan berada di atas layer **Tech Stack / Trusted Brands**.
   - Layer pembungkus **Top Layer** (`#121212`) juga memiliki `border-radius: 0 0 42px 42px` dan *border* bawah tipis `1px solid rgba(255,255,255,0.06)`, berada di atas latar hitam utama `#080808`.
3. **Sistem Grid:**
   - **4-Column Grid:** Digunakan pada daftar nomor layanan di bagian bawah Hero (`#01` s/d `#04`) dan detail layanan.
   - **12-Column / Split 50:50 Grid:** Digunakan pada header setiap section konten (`SectionHeader` — Kiri: Eyebrow `#FF5510` + H2, Kanan: Lead Paragraph + Micro-text & Orange Pill CTA).
   - **3-Column Grid:** Digunakan pada galeri kartu editorial (`aspect-[3/3.9]`, `gap: 20px`) serta daftar proyek pendukung.

---

## 5. Spesifikasi Komponen Reusable (`src/components/public/`)

Agar pembuatan halaman baru konsisten dan modular, gunakan komponen berikut:

### A. Tombol Pill CTA (`PillButton.tsx`)
1. **Variasi 1 — `variant="white"` (Di atas background Hero/Footer Oranye):**
   - Background: `#FFFFFF`, Text: `#0A0A0A` (`12.5px`–`13px`, SemiBold).
   - Padding: `6px 6px 6px 18px`, `border-radius: 9999px`.
   - Ikon Kanan: Lingkaran `28px x 28px` berwarna `#FF5510` dengan panah `→` warna putih.
2. **Variasi 2 — `variant="orange"` (Di atas background Hitam `#080808` / `#121212`):**
   - Background: `#FF5510` (hover `#FF6B2B`), Text: `#FFFFFF` (`12.5px`–`13px`, SemiBold).
   - Padding: `6px 6px 6px 18px`, `border-radius: 9999px`.
   - Ikon Kanan: Lingkaran `28px x 28px` berwarna `#FFFFFF` dengan panah `→` warna `#FF5510`.

### B. Kartu Visual Editorial (`EditorialIdentityCards.tsx` / `.bw-card`)
- **Rasio & Sudut:** Rasio vertikal `3 : 3.9`, `border-radius: 24px`, `overflow: hidden`.
- **Gaya Visual:** Render/fotografi studio monokrom kontras tinggi dengan latar objek abu-abu terang (`#E6E6E6` – `#CFCFCF`) sehingga memberi kontras mencolok terhadap background section `#080808`.
- **Interaksi (Hover):** Elemen visual melakukan *scale up* halus (`scale(1.04)`) dengan transisi `650ms cubic-bezier(0.22, 1, 0.36, 1)`.

### C. Bar Logo Tech Stack / Klien (`.logo-strip-mask` di `HeroSection.tsx`)
- Menampilkan micro-label di sisi kiri dan deretan logo monokrom putih (`#FFFFFF`, `15px` Bold, `tracking-[-0.02em]`) di sisi kanan.
- Sisi kanan memiliki *masking fade-out* (`linear-gradient(to right, black 82%, transparent 100%)`) untuk memberi kesan daftar ekosistem/klien yang berlanjut.

### D. Header Section 2-Kolom (`SectionHeader.tsx`)
- Komponen standar untuk membuka setiap section di atas latar `#080808` atau `#121212` (digunakan pada *Behind the Code*, *Selected Works*, *Capabilities*, dan halaman lanjutan).

### E. Compact Hero untuk Sub-Halaman (`CompactHero.tsx`)
- Digunakan pada halaman selain Landing Page (seperti `/projects/[slug]`, dan ke depannya `/about`, `/projects`, `/contact`).
- Memiliki navigasi `PublicNavbar`, gradien oranye-merah `.compact-hero-card` dengan `rounded-b-[42px]`, dan opsional bar metadata `#121212` `rounded-b-[42px]` di bawahnya sebelum masuk ke konten `#080808`.

### F. Bookend Footer (`FooterBookend.tsx`)
- Mengembalikan gradien oranye-merah menyala di bagian paling bawah halaman (`rounded-t-[42px]`), menciptakan efek pembuka-penutup (*bookend*) yang ikonik dengan teks raksasa `Let's Talk.` dan tombol *White Pill CTA*.

---

## 6. Panduan Pembuatan Halaman Baru Selanjutnya

Saat menambahkan halaman baru di `src/app/(public)/`:
1. **`/about` (Tentang & Perjalanan Akademik/Karier):**
   - Buka dengan `<CompactHero eyebrow="About Faqih" title="Engineering With Clarity" ... />`.
   - Gunakan `<SectionHeader />` di atas latar `#080808` untuk biografi lengkap, riwayat S1 Teknik Informatika UNESA '24, pengalaman *freelance*, dan daftar peralatan kerja (*tech stack* & *workflow*) dalam kartu `#121212` `rounded-[28px]`.
   - Tutup dengan `<FooterBookend />`.
2. **`/projects` (Arsip Seluruh Proyek & Filter Kategori):**
   - Buka dengan `<CompactHero eyebrow="Portfolio Archive" title="Selected Works" ... />`.
   - Tampilkan filter pill (`All`, `Web App`, `Mobile APK`, `AI System`) dengan state aktif `bg-[#FF5510] text-white rounded-full`, diikuti grid kartu proyek `#121212` `rounded-[28px]` ber-badge `#01`, `#02`, dst.
   - Tutup dengan `<FooterBookend />`.
3. **`/contact` / Inquiry System (`FooterBookend` & `/admin/inquiries`):**
   - Form `ContactForm` terhubung langsung ke tabel `public.inquiries` dengan proteksi honeypot & sliding-window rate limiter, dilengkapi kartu kanal langsung (WhatsApp, Email, GitHub) di atas `#080808`.

---

## 7. Standar Motion & Micro-Interactions (`src/components/motion/`)

Seluruh animasi wajib mematuhi prinsip **Awwwards-Grade Restraint & Zero-Bloat (60/120fps)** tanpa membajak native scroll:
1. **Kurva Transisi Utama:** `--ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1)`.
2. **GPU-Composited Primitives:**
   - `<Reveal />`: Progressive-enhanced scroll entrance (`fade-up`, `scale`, `mask-up`) dengan satu shared `IntersectionObserver` dan fallback penuh `@media (prefers-reduced-motion: reduce)`.
   - `<SpotlightCard />`: Pijar radial `#FF5510` tipis mengikuti kursor melalui CSS custom properties `--spot-x` / `--spot-y` di dalam `requestAnimationFrame` (**0 React re-render**).
   - `<HeroAmbientGlow />`: Pergeseran cahaya atmosferik *damped lerp* pada permukaan Fiery Sunset Glow yang otomatis tidur (`0% CPU`) saat kursor diam.
   - `PillButton`: *Directional arrow slide-through* murni CSS saat di-hover.
