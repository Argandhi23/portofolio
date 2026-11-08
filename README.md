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
- **Public Motion:**
  - GSAP + ScrollTrigger and Lenis drive the hero portal, project gallery, and editorial reveals, alongside smaller CSS/IntersectionObserver interactions. Animations respect reduced motion; the reduced-motion desktop gallery uses a vertical layout.
- **Automated Quality Gate (`Vitest` + `Playwright` + GitHub Actions CI):**
  - Unit & security test suites covering slug/storage utilities, Zod schemas, binary magic-byte inspection, rate limiting, and `requireAdmin()` authorization boundaries, paired with Playwright E2E browser verification.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, TypeScript `strict: true`) |
| **Database, Auth & Storage** | Supabase (`@supabase/ssr`, PostgreSQL RLS, Supabase Storage) |
| **Validation** | Zod v4 |
| **Styling & Design System** | Tailwind CSS v4 (*Editorial Dark & Warm Cream* — `#080808`, `#F5F0EB`, `#9E1B32`) |
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

## Recovery and operational verification

- Add `https://<your-site>/auth/callback` (and the localhost equivalent for development) to Supabase Auth Redirect URLs. Password recovery uses a PKCE code exchange, server-side admin verification, and `/reset-password`. Request and open the link in the same browser so its PKCE verifier cookie is available. Verify the actual email template and flow in a staging project before release.
- `next.config.ts` enables the documented experimental Turbopack `workerThreads` strategy only on Windows, following an observed CSS loader child-process failure on Windows/Node 22.20. Other platforms retain the default strategy. This is an environment workaround, not a confirmed general Windows defect. Next.js may fall back to child processes on affected Node versions; validate the deployment runtime.
- Uploads validate image signatures and restrict SVG to balanced static vector elements, explicitly allowed quoted attributes, and local fragment references. Inline styles, XML base/namespace overrides, comments, DTD/entities, and unsupported elements/attributes are rejected. This is a restricted SVG acceptance policy, not a general SVG sanitizer or full image decoder.
- Media cleanup follows a successful database mutation, checks for references in projects/brands/settings, and reports cleanup failures for manual retry. Database and Storage operations are not a single transaction; concurrent edits and abandoned uploads still require operational review.
- The in-memory rate limiter is per process, assumes trusted proxy IP headers, and does not protect direct Supabase inserts allowed by public RLS. Distributed or database abuse protection needs a separate infrastructure decision.
- Repository SQL describes intended policies; it does not prove the policies deployed on Supabase. Audit tests do not inspect private visitor/inquiry records or execute remote migrations.
- See [AUDIT.md](./AUDIT.md) for evidence, verification results, and remaining release checks.

- See [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) for separate local checks and service-dependent role, recovery, CRUD/media, cache, and protected endpoint tests.

- Ordinary admin logout uses Supabase `scope: local` (current session only); the mobile header exposes the same logout control as desktop.
