# AGENTS.md — System Architecture, Security & Coding Rules

Dokumen ini adalah instruksi utama (*Single Source of Truth*) untuk AI Agent dalam membangun, memelihara, dan mengembangkan Website Portofolio & CMS Admin (**Argandhi. / Folioblox Architecture**). Setiap kode yang dibuat **WAJIB** mematuhi seluruh aturan di bawah ini tanpa terkecuali.

---

## 1. Visi & Prinsip Utama Sistem
1. **System-First & Maintainable:** Kode harus modular, mudah dibaca, dan mudah dikembangkan untuk jangka panjang. Menambah, mengubah, atau menghapus konten portofolio cukup dilakukan dari Panel Admin (`/admin`) tanpa perlu menyentuh kode lagi.
2. **Ultra-Lightweight & Cepat:** Halaman publik tidak boleh membebani database Supabase di setiap request pengunjung. Gunakan arsitektur **Server Components + On-Demand Cache Revalidation (`unstable_cache` & `revalidateTag`)**.
3. **Keamanan Ketat (*Defense-in-Depth*):** Keamanan dijaga di 3 lapis sekaligus:
   - **Lapis 1 (Edge/Middleware):** Pencegahan akses rute `/admin/*` sebelum halaman di-render.
   - **Lapis 2 (Server Action Guard & Zod):** Verifikasi ulang identitas Admin dan validasi skema input di setiap mutasi data.
   - **Lapis 3 (Database RLS & Storage Policies):** Pembatasan mutlak di level PostgreSQL Supabase berdasarkan email Admin.
4. **Minimalist Editorial & Anti-AI-Cliché Motion:** Hindari ornamen visual khas generator AI (seperti *fake sci-fi HUD*, *glowing blur orbs* berlebihan, *traffic-light browser bar* palsu, atau tumpukan *pill badge* ramai). Gunakan tipografi kontras tinggi, garis tipis (*1px hairline*), serta animasi **GSAP (`gsap` + `ScrollTrigger`)** dan **Lenis** yang bersih dan terarah.

---

## 2. Tech Stack & Aturan Dependensi

### Library yang Diizinkan (Core Stack)
- **Framework:** Next.js (App Router, TypeScript `strict: true`)
- **Database, Auth, & Storage:** `@supabase/ssr` dan `@supabase/supabase-js`
- **Schema Validation:** `zod`
- **Styling:** Tailwind CSS v4
- **Animation & Scroll Choreography (Public Only):** `gsap` (`ScrollTrigger`) + `lenis` (disinkronkan di `SmoothScrollProvider.tsx`)
- **Icons:** `lucide-react` (import secara spesifik per ikon agar bundle tetap kecil)

### Larangan Keras (DILARANG Diinstal/Digunakan)
- **DILARANG** menggunakan ORM tambahan (seperti Prisma/Drizzle). Gunakan Supabase Client dengan TypeScript definitions (`database.types.ts`).
- **DILARANG** menggunakan state management global berat (seperti Redux, MobX).
- **DILARANG** mengekspos `SUPABASE_SERVICE_ROLE_KEY` di sisi client atau menggunakannya untuk mem-bypass RLS secara sembarangan. Cukup gunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan sesi autentikasi Admin.
- **DILARANG** menggunakan tipe `any` pada TypeScript.

---

## 3. Struktur Direktori Wajib

Seluruh file harus ditempatkan sesuai struktur modular berikut:

~~~text
src/
├── app/
│   ├── (public)/                  # Rute publik (di-cache penuh, sangat ringan)
│   │   ├── layout.tsx             # SmoothScrollProvider + IntroPreloader + ChatWidget
│   │   ├── page.tsx               # Landing page utama (HeroEyePortal + GSAP Horizontal Projects + Parallax Services)
│   │   ├── about/page.tsx         # Halaman profil & timeline lengkap
│   │   └── projects/              # Arsip proyek & detail studi kasus
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx           # Halaman login khusus Admin
│   └── admin/                     # Rute Panel Admin (diproteksi Middleware + Guard)
│       ├── layout.tsx             # Sidebar & Header Admin
│       ├── page.tsx               # Ringkasan analitik pengunjung, inquiry, & shortcut CRUD
│       ├── projects/              # CRUD Projects (List, New, Edit)
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── services/              # CRUD Services (#01 - #04)
│       │   └── page.tsx
│       ├── brands/                # CRUD Trusted Brands / Tech Stack
│       │   └── page.tsx
│       ├── inquiries/             # Kotak masuk pesan klien
│       │   └── page.tsx
│       └── settings/              # Form Singleton untuk Hero, About, & Kontak
│           └── page.tsx
├── actions/                       # Next.js Server Actions ('use server')
│   ├── auth.actions.ts            # Login & Logout Admin
│   ├── storage.actions.ts         # Upload & Auto-Delete file di Supabase Storage
│   ├── project.actions.ts         # Create, Update, Delete, Toggle Publish/Featured
│   ├── service.actions.ts         # CRUD Services
│   ├── brand.actions.ts           # CRUD Brands
│   ├── inquiry.actions.ts         # Submit (Public) & Manage (Admin) Inquiries
│   ├── chatbot.actions.ts         # AI Assistant untuk pengunjung
│   └── settings.actions.ts        # Update Site Settings
├── components/
│   ├── admin/                     # Komponen UI khusus Panel Admin (Form, Tabel, Upload)
│   ├── motion/                    # Engine animasi GSAP + Lenis + ScrollTrigger
│   │   ├── SmoothScrollProvider.tsx
│   │   ├── HeroEyePortal.tsx      # Phase 1 Head-Turn Scrub + Phase 2 Eye Dive Portal (#080808 -> #F5F0EB)
│   │   ├── WhiteToDarkPortalBridge.tsx # Transisi tirai clip-path (#F5F0EB -> #080808)
│   │   ├── GsapProjectsStage.tsx  # Pinned GSAP Horizontal Scroll untuk Projects
│   │   ├── GsapSplitText.tsx      # GSAP Masked Word Reveal untuk tipografi
│   │   ├── GsapContactCockpit.tsx # Animasi GSAP untuk Contact & Footer
│   │   ├── FooterCurtain.tsx
│   │   ├── IntroPreloader.tsx
│   │   └── scroll-coordinator.ts
│   ├── public/                    # Komponen UI halaman depan (Hero, SectionHeader, SelectedWorks, Services, Footer)
│   └── ui/                        # Komponen atomik ringan (Button, Input, Badge, Modal, Icons)
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # createBrowserClient
│   │   ├── server.ts              # createServerClient (menggunakan cookies Next.js)
│   │   └── middleware.ts          # Helper updateSession & proteksi rute /admin
│   ├── i18n/                      # Sistem bilingual EN / ID (localized.ts & dictionary.ts)
│   ├── auth-guard.ts              # Fungsi wajib requireAdmin() untuk Server Actions
│   ├── file-security.ts           # Validasi magic bytes & sanitasi SVG
│   ├── scroll-math.ts             # Fungsi matematika murni untuk animasi & unit test
│   ├── validations/               # Skema Zod untuk semua input form
│   ├── queries/                   # Fungsi read data ter-cache untuk halaman publik
│   │   └── portfolio.queries.ts
│   └── utils.ts                   # Helper slugify, format tanggal, & ekstraksi path storage
├── types/
│   ├── database.types.ts          # Definisi tipe tabel Supabase
│   └── action.types.ts            # Standar return type Server Actions
└── middleware.ts                  # Entry point Next.js Middleware
~~~

---

## 4. Kontrak Skema Database & Storage

Agent harus selalu mengacu pada struktur tabel berikut saat menulis query atau tipe TypeScript:

1. **`public.site_settings` (Singleton Row `id = 1`):**
   - `id` (int, PK, selalu `1`)
   - `brand_name` (text) — contoh: *"Argandhi."*
   - `hero_greeting`, `hero_title`, `hero_subtitle`, `hero_description` (text — mendukung format bilingual `"EN || ID"`)
   - `hero_image_url` (text, nullable)
   - `about_label`, `about_heading`, `about_description` (text)
   - `contact_email`, `whatsapp_number`, `github_url` (text, nullable)
   - `cta_url` (text, default `'#contact'`)
   - `updated_at` (timestamptz)

2. **`public.services` (Daftar Keahlian `#01` s/d `#04`):**
   - `id` (uuid, PK)
   - `number_label` (text) — contoh: `'#01'`, `'#02'`
   - `title` (text)
   - `display_order` (int)
   - `is_active` (boolean)
   - `created_at` (timestamptz)

3. **`public.brands` (Deretan Logo Tech Stack / Klien):**
   - `id` (uuid, PK)
   - `name` (text)
   - `logo_url` (text, nullable)
   - `website_url` (text, nullable)
   - `display_order` (int)
   - `is_active` (boolean)
   - `created_at` (timestamptz)

4. **`public.projects` (Item Portofolio Utama):**
   - `id` (uuid, PK)
   - `title` (text)
   - `slug` (text, unique)
   - `category` (text)
   - `client_name` (text, nullable)
   - `summary` (text, nullable)
   - `content` (text, nullable — mendukung format Markdown untuk detail studi kasus)
   - `thumbnail_url` (text)
   - `gallery_urls` (text[], default `'{}'`)
   - `tech_stack` (text[], default `'{}'`)
   - `project_url`, `github_url`, `apk_url` (text, nullable)
   - `is_featured` (boolean)
   - `status` (text: `'draft'` | `'published'`)
   - `display_order` (int)
   - `created_at`, `updated_at` (timestamptz)

5. **`public.inquiries` (Kotak Masuk Pesan / Project Brief Klien):**
   - `id` (uuid, PK)
   - `name` (text, 2–120 chars)
   - `email` (text, 5–160 chars)
   - `subject` (text, nullable)
   - `message` (text, 10–4000 chars)
   - `status` (text: `'unread'` | `'read'` | `'replied'`)
   - `created_at`, `updated_at` (timestamptz)
   - *RLS:* Publik (`anon`, `authenticated`) hanya diizinkan `INSERT` (`status = 'unread'`); hanya `public.is_admin()` yang diizinkan `SELECT`, `UPDATE`, dan `DELETE`.

6. **Supabase Storage Bucket:**
   - Nama Bucket: `portfolio-media` (Public Read, Admin-Only Write/Delete, Maks 5MB, MIME: `image/webp`, `image/jpeg`, `image/png`, `image/avif`, `image/svg+xml` dengan verifikasi binary *magic bytes* & sanitasi XSS SVG di `src/lib/file-security.ts`).

7. **Quality Gate & Testing Wajib (`Vitest` & `Playwright`):**
   - Setiap perubahan arsitektur/validasi/keamanan/animasi wajib lulus `npm run typecheck`, `npm run lint`, `npm run test` (`tests/unit/*.test.ts`), dan `npm run build`.

---

## 5. Aturan Keamanan Ketat (Security Invariants)

1. **Verifikasi Token Server-Side (`getUser` vs `getSession`):**
   - **DILARANG KERAS** menggunakan `supabase.auth.getSession()` di dalam `middleware.ts`, Server Components, atau Server Actions karena data cookie bisa dipalsukan.
   - **WAJIB** selalu memanggil `const { data: { user }, error } = await supabase.auth.getUser()`.

2. **Helper `requireAdmin()` Wajib di Semua Server Actions Admin:**
   - Buat fungsi `requireAdmin()` di `src/lib/auth-guard.ts`.
   - Fungsi ini memverifikasi bahwa `user` tidak null **DAN** `user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()`.
   - Setiap fungsi mutasi Admin di `src/actions/*.ts` **WAJIB** memanggil `await requireAdmin()` di baris paling atas sebelum mengeksekusi logika apa pun.

3. **Proteksi Rute di `src/middleware.ts`:**
   - Semua request ke `/admin/:path*` yang tidak lolos cek `user` dan pencocokan `ADMIN_EMAIL` wajib di-redirect ke `/login`.
   - Jika Admin yang sudah terautentikasi mengakses `/login`, redirect otomatis ke `/admin/projects`.

4. **Validasi Input & Sanitasi:**
   - Semua data yang masuk ke Server Actions (`FormData` atau objek JSON) wajib divalidasi dengan skema Zod menggunakan `.safeParse()`.
   - Slug project wajib di-sanitasi menjadi huruf kecil, angka, dan tanda hubung (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).

5. **Manajemen Kebersihan Storage (Anti-Orphan Files):**
   - Saat Admin mengganti `thumbnail_url` atau `logo_url` dengan gambar baru, atau saat Admin menghapus sebuah item project/brand, sistem **WAJIB** menghapus file gambar lama dari bucket `portfolio-media` agar penyimpanan Supabase tetap bersih dan hemat kuota.

---

## 6. Strategi Performa, Caching, & Revalidasi

1. **Cache Tags Terstandarisasi (`src/lib/queries/portfolio.queries.ts`):**
   - `CACHE_TAGS.SETTINGS = 'portfolio-settings'`
   - `CACHE_TAGS.SERVICES = 'portfolio-services'`
   - `CACHE_TAGS.BRANDS = 'portfolio-brands'`
   - `CACHE_TAGS.PROJECTS = 'portfolio-projects'`

2. **Fungsi Query Publik (`unstable_cache`):**
   - Bungkus pengambilan data publik menggunakan `unstable_cache` dari `next/cache` dengan tag yang sesuai.
   - Halaman publik hanya boleh mengambil project dengan `status = 'published'` dan mengurutkannya berdasarkan `display_order ASC, created_at DESC`.

3. **On-Demand Invalidation Saat CRUD:**
   - Setiap kali Server Action berhasil melakukan mutasi (Create, Update, Delete, Toggle Status), panggil `revalidateTag(CACHE_TAGS.XXX)` dan `revalidatePath('/')` serta rute terkait.

---

## 7. Standar Kode & Pola Server Actions

Semua Server Actions harus mengembalikan format respons yang seragam (`ActionResult<T>`):

~~~typescript
export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
};
~~~

**Aturan Penulisan Komponen:**
- Gunakan **Server Components** secara default untuk semua halaman (`page.tsx`).
- Gunakan `'use client'` **hanya** pada komponen interaktif terkecil atau controller animasi GSAP/Lenis.
- Pastikan seluruh animasi GSAP menghormati `prefers-reduced-motion: reduce` dan dibersihkan (`ctx.revert()` / `mm.revert()`) saat komponen *unmount*.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
