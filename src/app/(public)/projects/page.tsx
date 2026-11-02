import type { Metadata } from 'next';
import {
  getPublishedProjects,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { ProjectsArchiveGrid } from '@/components/public/ProjectsArchiveGrid';
import { FooterBookend } from '@/components/public/FooterBookend';
import { T } from '@/components/public/LanguageProvider';
import { Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Projects — Argandhi.',
  description:
    'Web applications, Flutter mobile APKs, and AI software by Faqih Rafasha Argandhi.',
};

export default async function ProjectsArchivePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ]);

  const brandName = settings.brand_name || 'Argandhi.';
  const countFormatted = String(projects.length).padStart(2, '0');

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      <div className="relative border-b border-white/[0.08]">
        <div className="relative z-10 pt-7 px-6 sm:px-12">
          <PublicNavbar
            brandName={brandName}
            ctaUrl="/#contact"
            isSubPage
            surfaceVariant="obsidian"
          />

          <header className="w-full max-w-[1140px] mx-auto pt-14 sm:pt-18 pb-12 sm:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8 space-y-3">
                <Reveal variant="mask-up" delay={40}>
                  <h1 className="text-white font-bold text-[44px] sm:text-[64px] lg:text-[72px] leading-[0.95] tracking-[-0.04em]">
                    <T
                      en={
                        <>
                          Selected Works<span className="text-[#FF5510]">.</span>
                        </>
                      }
                      id={
                        <>
                          Daftar Proyek<span className="text-[#FF5510]">.</span>
                        </>
                      }
                    />
                  </h1>
                </Reveal>

                <Reveal variant="fade-up" delay={140}>
                  <p className="text-white/75 text-[15.5px] sm:text-[17.5px] leading-[1.55] max-w-xl font-normal">
                    <T
                      en="Web apps, mobile APKs, and AI systems."
                      id="Aplikasi web, APK mobile, dan sistem AI."
                    />
                  </p>
                </Reveal>
              </div>

              <Reveal
                variant="fade-up"
                delay={180}
                className="lg:col-span-4 flex lg:justify-end"
              >
                <div className="rounded-2xl border border-white/[0.09] bg-[#111111] px-5 py-3 flex items-center gap-3.5">
                  <span className="text-[30px] sm:text-[36px] font-mono font-bold leading-none text-white tracking-tight">
                    {countFormatted}
                  </span>
                  <div className="h-6 w-px bg-white/10" />
                  <span className="text-[12px] font-mono text-white/80 font-medium">
                    <T en="Projects" id="Proyek" />
                  </span>
                </div>
              </Reveal>
            </div>
          </header>
        </div>
      </div>

      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-14 sm:py-18">
        <ProjectsArchiveGrid projects={projects} />
      </section>

      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
