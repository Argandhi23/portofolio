import type { Metadata } from 'next';
import {
  Award,
  Code2,
  Cpu,
  GraduationCap,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  getBrands,
  getServices,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { CompactHero } from '@/components/public/CompactHero';
import { SectionHeader } from '@/components/public/SectionHeader';
import { PillButton } from '@/components/public/PillButton';
import { FooterBookend } from '@/components/public/FooterBookend';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { TechLogo } from '@/components/ui/TechLogos';

export const metadata: Metadata = {
  title: 'About Faqih Rafasha Argandhi — Argandhi.',
  description:
    'Academic journey at S1 Informatics Engineering UNESA, software architecture philosophy, and full-stack capabilities of Faqih Rafasha Argandhi.',
};

const ENGINEERING_PRINCIPLES = [
  {
    num: '01',
    title: 'System-First & Maintainable',
    description:
      'Every codebase is structured modularly with strict TypeScript contracts so adding features months later feels clean and predictable.',
    icon: Layers,
  },
  {
    num: '02',
    title: 'Defense-in-Depth Security',
    description:
      'Security is never an afterthought — enforced simultaneously across Edge Middleware, Server Action Zod validation, and PostgreSQL RLS.',
    icon: ShieldCheck,
  },
  {
    num: '03',
    title: 'Ultra-Lightweight Speed',
    description:
      'Zero unnecessary client bloat. Leveraging React Server Components, tagged on-demand cache revalidation, and GPU-composited motion.',
    icon: Zap,
  },
  {
    num: '04',
    title: 'Pragmatic AI & Mobile Delivery',
    description:
      'Bridging modern web platforms (Next.js & Supabase) with cross-platform Flutter APKs and practical AI automation workflows.',
    icon: Cpu,
  },
];

export default async function AboutPage() {
  const [settings, brands, services] = await Promise.all([
    getSiteSettings(),
    getBrands(),
    getServices(),
  ]);

  const brandName = settings.brand_name || 'Argandhi.';

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      <CompactHero
        brandName={brandName}
        ctaUrl="/#contact"
        backHref="/"
        backLabel="Back to Home"
        eyebrow="About Faqih"
        title="Engineering With Clarity"
        summary="Full-Stack & Software Developer based in Surabaya, Indonesia — combining Informatics Engineering fundamentals at UNESA ('24) with production freelance delivery."
        actions={
          <>
            <PillButton href="/projects" variant="white">
              Explore Selected Works
            </PillButton>
          </>
        }
        bottomStrip={
          <div className="flex flex-wrap items-center justify-between gap-6 text-xs">
            <div className="inline-flex items-center gap-2.5 text-white/90 font-semibold">
              <GraduationCap className="h-4 w-4 text-[#FF5510]" />
              <span>
                S1 Teknik Informatika — Universitas Negeri Surabaya (&apos;24)
              </span>
            </div>
            <div className="text-[#7A7A7A]">
              Surabaya, East Java, Indonesia &bull; Open for Freelance &amp; Collaboration
            </div>
          </div>
        }
      />

      {/* 1. Narrative & Academic/Career Timeline */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-20 space-y-14">
        <SectionHeader
          eyebrow="Background & Focus"
          heading={
            <>
              Turning Complex Requirements
              <br />
              Into Reliable Software
            </>
          }
          lead={
            settings.about_description ||
            "I'm Faqih Rafasha Argandhi. I build production-ready web platforms, D2C e-commerce engines, mobile APKs, and AI-assisted systems designed to perform under real-world traffic."
          }
          ctaHref="/#contact"
          ctaLabel="Start a conversation"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Reveal variant="fade-up" className="md:col-span-7">
            <SpotlightCard className="h-full rounded-[28px] bg-[#121212] border border-white/[0.07] p-7 sm:p-9 space-y-5 overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5510]">
                  <Award className="h-4 w-4" />
                  <span>Academic &amp; Practical Foundation</span>
                </div>
                <h3 className="text-white font-bold text-2xl tracking-[-0.025em]">
                  Informatics Engineering (UNESA &apos;24) &amp; Production Freelancing
                </h3>
                <p className="text-white/75 text-sm leading-[1.75]">
                  Studying Informatics Engineering at Universitas Negeri Surabaya
                  shaped how I approach software from the ground up: data
                  structures, relational database integrity, authentication
                  boundaries, and clean software architecture.
                </p>
                <p className="text-white/75 text-sm leading-[1.75]">
                  Outside the classroom, I ship live commercial products — from
                  zero-trust e-commerce checkout engines with dynamic QRIS and
                  automated multi-courier shipping to cross-platform Flutter
                  Android APKs and custom CMS platforms.
                </p>
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal variant="fade-up" delay={90} className="md:col-span-5">
            <SpotlightCard className="h-full rounded-[28px] bg-[#121212] border border-white/[0.07] p-7 sm:p-9 flex flex-col justify-between space-y-6 overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5510]">
                  <Code2 className="h-4 w-4" />
                  <span>Core Disciplines</span>
                </div>
                <ul className="space-y-3">
                  {services.map((svc) => (
                    <li
                      key={svc.id}
                      className="flex items-center justify-between rounded-2xl bg-[#181818] border border-white/[0.06] px-4 py-3 text-xs sm:text-sm font-semibold"
                    >
                      <span className="text-white">{svc.title}</span>
                      <span className="text-[#FF5510] font-bold">
                        {svc.number_label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      {/* 2. Engineering Principles (#121212 Rounded-[42px] Surface) */}
      <section className="px-3 sm:px-6 py-4">
        <div className="bg-[#121212] rounded-[42px] border border-white/[0.07] py-18 sm:py-22 px-6 sm:px-12">
          <div className="w-full max-w-[1140px] mx-auto space-y-12">
            <Reveal variant="fade-up" className="max-w-2xl space-y-2">
              <p className="text-[#FF5510] font-semibold text-base">
                # Architectural Standards
              </p>
              <h2 className="text-white font-bold text-3xl sm:text-4xl tracking-[-0.03em]">
                How Every Project Is Engineered
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ENGINEERING_PRINCIPLES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.num} variant="fade-up" delay={idx * 70}>
                    <SpotlightCard className="h-full rounded-[24px] bg-[#181818] border border-white/[0.06] hover:border-[#FF5510]/35 p-6 sm:p-7 space-y-4 transition-colors overflow-hidden">
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#121212] border border-white/[0.08] text-[#FF5510]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold">
                            <span className="text-[#FF5510]">#</span>
                            <span className="text-white">{item.num}</span>
                          </span>
                        </div>

                        <h3 className="text-white font-bold text-lg tracking-[-0.02em]">
                          {item.title}
                        </h3>
                        <p className="text-white/70 text-[13px] leading-[1.65]">
                          {item.description}
                        </p>
                      </div>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tech Stack & Ecosystem Matrix */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-16 sm:py-20 space-y-8">
        <Reveal variant="fade-up" className="space-y-2">
          <p className="text-[#FF5510] font-semibold text-sm">
            # Production Toolkit
          </p>
          <h2 className="text-white font-bold text-2xl sm:text-3xl tracking-[-0.025em]">
            Technologies &amp; Ecosystem
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand, idx) => (
            <Reveal key={brand.id} variant="fade-up" delay={idx * 40}>
              <SpotlightCard className="rounded-[20px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-4 flex items-center gap-3 transition-colors overflow-hidden">
                <div className="relative z-10 flex items-center gap-3">
                  <TechLogo
                    name={brand.name}
                    monochrome
                    className="h-5 w-5 text-white shrink-0"
                  />
                  <span className="text-sm font-bold text-white truncate">
                    {brand.name}
                  </span>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
