# Argandhi. — Full-Stack Portfolio & Zero-Bloat CMS Platform

Official portfolio and custom headless CMS of **Faqih Rafasha Argandhi (`Argandhi.`)** — Informatics Engineering student at Universitas Negeri Surabaya (UNESA '24) & Full-Stack Software Developer.

Engineered with a **System-First, Ultra-Lightweight, and Defense-in-Depth** architecture so every project case study, capability, tech stack badge, profile setting, and client project inquiry is managed dynamically from `/admin` with instant on-demand cache revalidation.

---

## Key Architectural Highlights

- **Ultra-Fast Public Pages (RSC + On-Demand Cache Revalidation):**
  - Public routes (`/`, `/about`, `/projects`, `/projects/[slug]`) are built as React Server Components backed by Next.js `unstable_cache` and `generateStaticParams()`.
  - **0ms Public Middleware Fast-Path:** Visitors without a Supabase session cookie bypass auth network roundtrips completely, while every Admin mutation triggers instant `revalidateTag()` invalidation.
- **3-Layer Defense-in-Depth Security:**
  1. **Edge Middleware (`src/middleware.ts`):** Verifies JWTs server-side via `supabase.auth.getUser()` (never `getSession()`) and restricts `/admin/*` strictly to `ADMIN_EMAIL`.
  2. **Server Action Guard & Deep Input Inspection:** Every mutation enforces `requireAdmin()`, strict `zod` schemas, sliding-window rate limiting (`src/lib/rate-limit.ts`), binary magic-byte verification, and SVG XSS scanning (`src/lib/file-security.ts`).
  3. **PostgreSQL Row Level Security (RLS) & Storage Policies:** Database-enforced `public.is_admin()` policies across `site_settings`, `services`, `brands`, `projects`, `inquiries`, and the `portfolio-media` bucket (with automatic anti-orphan media cleanup).
- **Awwwards-Inspired Zero-Bloat GPU Motion (60/120fps):**
  - Custom lightweight client islands (`<Reveal>`, `<SpotlightCard>`, `<HeroAmbientGlow>`, `<ReadingProgressBar>`, `<ImageLightbox>`, and Adaptive Floating Obsidian-Glass Navbar) built on `IntersectionObserver`, CSS variables, and `requestAnimationFrame` with zero scroll-hijacking and full `prefers-reduced-motion` accessibility.
- **Automated Quality Gate (`Vitest` + `Playwright` + GitHub Actions CI):**
  - Unit & security test suites covering slug/storage utilities, Zod schemas, binary magic-byte inspection, rate limiting, and `requireAdmin()` authorization boundaries, paired with Playwright E2E browser verification.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, TypeScript `strict: true`) |
| **Database, Auth & Storage** | Supabase (`@supabase/ssr`, PostgreSQL RLS, Supabase Storage) |
| **Validation** | Zod v4 |
| **Styling & Design System** | Tailwind CSS v4 (*Warm Futuristic Dark Mode* — `#080808` & `#FF5510`) |
| **Testing & CI** | Vitest, Playwright, ESLint 9, GitHub Actions |

---

## Local Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ADMIN_EMAIL=your-admin-email@gmail.com
   ```

3. **Initialize Supabase Schema & RLS:**
   Open **Supabase Dashboard → SQL Editor**, update the admin email inside `public.is_admin()` in [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.

4. **Start development server:**
   ```bash
   npm run dev
   ```

---

## Quality Gate & Testing Commands

```bash
# Strict TypeScript verification
npm run typecheck

# ESLint static analysis
npm run lint

# Vitest unit & security test suite
npm run test

# Production build & SSG verification
npm run build

# End-to-End browser tests (Playwright)
npm run test:e2e
```

---

## Documentation References

- [`AGENTS.md`](./AGENTS.md) — System Architecture, Security Invariants & Coding Standards.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — Visual Identity, Color Tokens, Typography, Layout & Motion Guidelines.
