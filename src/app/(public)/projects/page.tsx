import type { Metadata } from 'next';
import {
  getPublishedProjects,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { ProjectsArchiveGrid } from '@/components/public/ProjectsArchiveGrid';
import { FooterBookend } from '@/components/public/FooterBookend';
import { Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Selected Works & System Archive — Argandhi.',
  description:
    'Explore production web applications, mobile APKs, and AI-integrated software systems engineered by Faqih Rafasha Argandhi.',
};

export default async function ProjectsArchivePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ]);

  const brandName = settings.brand_name || 'Argandhi.';
  const countFormatted = String(projects.length).padStart(2, '0');
  const uniqueDisciplines = new Set(
    projects.map((p) => p.category.trim()).filter(Boolean)
  ).size;

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      {/* =====================================================================
          1. CLEAN ARCHITECTURAL HEADER & SIMPLE STAT COUNTER
      ===================================================================== */}
      <div className="relative border-b border-white/[0.08]">
        <div className="relative z-10 pt-7 px-6 sm:px-12">
          <PublicNavbar
            brandName={brandName}
            ctaUrl="/#contact"
            isSubPage
            surfaceVariant="obsidian"
          />

          <header className="w-full max-w-[1140px] mx-auto pt-14 sm:pt-20 pb-14 sm:pb-18">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
              {/* Left 8 Columns: Direct Typographic Title */}
              <div className="lg:col-span-8 space-y-4">
                <Reveal variant="fade-up">
                  <p className="text-[11.5px] font-mono uppercase tracking-[0.22em] text-[#FF5510]">
                    INDEX // 2024 — 2026
                  </p>
                </Reveal>

                <Reveal variant="mask-up" delay={80}>
                  <h1 className="text-white font-bold text-[44px] sm:text-[66px] lg:text-[76px] leading-[0.95] tracking-[-0.04em]">
                    Selected Works{' '}
                    <br />
                    <span className="text-white/40">&amp; System Archive.</span>
                  </h1>
                </Reveal>

                <Reveal variant="fade-up" delay={160}>
                  <p className="text-white/75 text-[15.5px] sm:text-[18px] leading-[1.6] max-w-2xl font-normal pt-1">
                    Every release below is engineered for production longevity —
                    spanning full-stack cloud platforms, cross-platform mobile
                    APKs, and intelligent automation.
                  </p>
                </Reveal>
              </div>

              {/* Right 4 Columns: Simple Minimal Stat Counter */}
              <Reveal
                variant="fade-up"
                delay={180}
                className="lg:col-span-4 flex lg:justify-end"
              >
                <div className="rounded-2xl border border-white/[0.09] bg-[#111111] px-5 py-3.5 flex items-center gap-4">
                  <span className="text-[34px] sm:text-[40px] font-mono font-bold leading-none text-white tracking-tight">
                    {countFormatted}
                  </span>
                  <div className="h-7 w-px bg-white/10" />
                  <div className="text-[11px] font-mono text-[#7A7A7A] leading-[1.35]">
                    <span className="text-white font-medium block">Shipped Projects</span>
                    <span>{Math.max(1, uniqueDisciplines)} Disciplines</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </header>
        </div>
      </div>

      {/* =====================================================================
          2. VARIED PARALLAX GALLERY & INTERACTIVE INDEX LIST
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-14 sm:py-20">
        <ProjectsArchiveGrid projects={projects} />
      </section>

      {/* =====================================================================
          3. SIGNATURE FIERY BOOKEND FOOTER WITH CURTAIN UNVEIL
      ===================================================================== */}
      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
