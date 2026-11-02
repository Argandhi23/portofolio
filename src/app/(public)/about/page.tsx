import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  getBrands,
  getServices,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PillButton } from '@/components/public/PillButton';
import { FooterBookend } from '@/components/public/FooterBookend';
import { Reveal } from '@/components/motion/Reveal';
import { ParallaxMedia } from '@/components/motion/ParallaxMedia';
import { ScrollTextReveal } from '@/components/motion/ScrollTextReveal';
import { TechLogo } from '@/components/ui/TechLogos';

export const metadata: Metadata = {
  title: 'About Faqih Rafasha Argandhi — Argandhi.',
  description:
    'Informatics Engineering student at UNESA, Next-Gen AI Engineer cohort at Asah led by Dicoding (supported by GoTo), and Full-Stack Software Developer.',
};

interface EditorialJourneyEntry {
  period: string;
  role: string;
  place: string;
  badge?: string;
  summary: string;
}

const EDITORIAL_JOURNEY: EditorialJourneyEntry[] = [
  {
    period: 'ONGOING · CURRENT COHORT',
    role: 'Next-Gen AI Engineer Cohort — Program Asah',
    place: 'Led by Dicoding · Supported by GoTo',
    badge: 'Active Cohort',
    summary:
      'Selected for the intensive ~376-hour industry tech scholarship and independent study program led by Dicoding and supported by GoTo. Mastering Python, Machine Learning, Deep Learning, Generative AI, and Prompt Engineering for Software Developers with code-by-code expert reviews and a real-world AI capstone.',
  },
  {
    period: '2024 — PRESENT',
    role: 'Freelance Full-Stack & Mobile Software Developer',
    place: 'Surabaya, ID · Remote Worldwide',
    summary:
      'Architecting and shipping commercial digital products end-to-end — from zero-trust D2C e-commerce platforms with dynamic QRIS and multi-courier shipping automation to cross-platform Flutter Android APKs and custom CMS dashboards.',
  },
  {
    period: "2024 — COHORT '24",
    role: 'B.Sc. in Informatics Engineering (S1 Teknik Informatika)',
    place: 'Universitas Negeri Surabaya (UNESA)',
    summary:
      'Building a rigorous computer science foundation across data structures, relational database normalization, system security boundaries, and applied artificial intelligence workflows.',
  },
  {
    period: 'FIELD INTERNSHIP · 2 MONTHS',
    role: 'Web Design & Practical IT Intern (PKL)',
    place: 'LPK Singosari · Malang, East Java',
    summary:
      'Completed a two-month hands-on field internship (Praktik Kerja Lapangan) in Singosari, Malang — translating web design fundamentals into structured real-world assignments, collaborative operational workflows, and disciplined delivery.',
  },
  {
    period: 'HIGH SCHOOL · VOCATIONAL TRACK',
    role: 'Kelas Keterampilan Desain Web (MA Plus Keterampilan)',
    place: 'MAN 2 Kota Madiun',
    summary:
      'Early practical foundation in web design, interface layouting, and digital multimedia through MAN 2 Kota Madiun’s specialized vocational Web Design track — sparking an enduring passion for front-end craft and software engineering.',
  },
];

const ARCHITECTURAL_STANDARDS = [
  {
    num: '01',
    title: 'System-First & Long-Term Maintainability',
    detail:
      'Every project is engineered as a living system — modular directories, strict TypeScript contracts, and self-service Admin CMS controls so content evolves without touching code.',
  },
  {
    num: '02',
    title: 'Three-Layer Defense-in-Depth Security',
    detail:
      'Protection is enforced simultaneously at the Edge Middleware boundary, Server Action Zod validation layer, and PostgreSQL Row-Level Security policies.',
  },
  {
    num: '03',
    title: 'Zero-Bloat Speed & Fluid Motion',
    detail:
      'React Server Components and on-demand tagged cache revalidation keep database load near zero while GPU-composited motion makes every scroll feel effortless.',
  },
  {
    num: '04',
    title: 'Unified Web, Mobile APK & AI Delivery',
    detail:
      'Bridging modern Next.js + Supabase cloud platforms with native-feeling Flutter mobile releases and pragmatic Generative AI engineering.',
  },
];

function EditorialMonographPortrait({
  heroImageUrl,
  brandName,
}: {
  heroImageUrl: string | null;
  brandName: string;
}) {
  if (heroImageUrl) {
    return (
      <div className="relative rounded-[28px] overflow-hidden border border-white/[0.1] bg-[#111111] shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
        <ParallaxMedia
          intensity={18}
          className="aspect-[3/4.05] w-full bg-[#151515]"
          innerClassName="relative h-full w-full"
        >
          <Image
            src={heroImageUrl}
            alt={`${brandName} — Faqih Rafasha Argandhi`}
            fill
            priority
            className="object-cover object-top grayscale contrast-125"
            sizes="(max-width: 1024px) 100vw, 440px"
            unoptimized={
              heroImageUrl.startsWith('data:') ||
              heroImageUrl.endsWith('.svg')
            }
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/20"
          />
        </ParallaxMedia>

        {/* Print-Magazine Caption Plate */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7 flex items-end justify-between gap-4 border-t border-white/10 bg-[#0B0B0B]/88">
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#FF5510]">
              FIG. 01 // PROFILE
            </p>
            <p className="text-white font-bold text-[15px] tracking-[-0.02em] mt-1">
              Faqih Rafasha Argandhi
            </p>
          </div>
          <span className="text-[11px] font-mono text-white/60 text-right">
            SURABAYA, ID
          </span>
        </div>
      </div>
    );
  }

  // High-End Developer Identity & Architectural Specimen Card (active when photo is not uploaded)
  return (
    <div className="relative rounded-[28px] overflow-hidden border border-white/[0.12] bg-[#121212] shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex flex-col justify-between">
      {/* Top macOS-style Terminal Bar */}
      <div className="h-10 shrink-0 bg-[#171717] border-b border-white/[0.08] px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/85" />
        </div>
        <span className="text-[11.5px] font-mono text-white/65">
          engineer.identity.ts
        </span>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#FF5510] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510] animate-pulse" />
          <span>ACTIVE</span>
        </div>
      </div>

      {/* Code & Architectural Spec Body */}
      <div className="p-6 sm:p-7 space-y-4 font-mono text-[12px] sm:text-[12.5px] leading-[1.62]">
        <div className="space-y-1 text-white/75">
          <p className="text-[#7A7A7A]">{'// Developer Identity & Pathway'}</p>
          <p>
            <span className="text-[#FF5510]">const</span>{' '}
            <span className="text-white font-semibold">engineer</span> = &#123;
          </p>
          <div className="pl-4 space-y-1 text-white/85">
            <p>
              <span className="text-white/45">name:</span>{' '}
              <span className="text-[#E6E6E6]">&apos;Faqih Rafasha Argandhi&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">role:</span>{' '}
              <span className="text-[#FF5510]">&apos;Full-Stack &amp; Software Dev&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">academic:</span>{' '}
              <span className="text-[#E6E6E6]">&apos;UNESA (\&apos;24) &bull; S1 Informatika&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">activeCohort:</span>{' '}
              <span className="text-[#FF5510] font-semibold">&apos;Asah (Dicoding &amp; GoTo)&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">track:</span>{' '}
              <span className="text-white font-bold">&apos;Next-Gen AI Engineer&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">roots:</span> [
              <br />
              <span className="pl-3 text-[#B0B0B0]">&apos;MAN 2 Madiun (Web Design)&apos;</span>,
              <br />
              <span className="pl-3 text-[#B0B0B0]">&apos;LPK Singosari (PKL Intern)&apos;</span>
              <br />
              ],
            </p>
            <p>
              <span className="text-white/45">focus:</span> [
              <br />
              <span className="pl-3 text-[#B0B0B0]">&apos;Clean System Architecture&apos;</span>,
              <br />
              <span className="pl-3 text-[#B0B0B0]">&apos;Cross-Platform Flutter APKs&apos;</span>,
              <br />
              <span className="pl-3 text-[#B0B0B0]">&apos;Pragmatic AI Systems&apos;</span>
              <br />
              ],
            </p>
          </div>
          <p>&#125;;</p>
        </div>

        {/* Core Stack Pills inside the card */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#7A7A7A] block">
            VERIFIED STACK MATRIX
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['Next.js 16', 'TypeScript', 'Supabase', 'Flutter APK', 'Python AI'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#181818] border border-white/[0.08] px-2.5 py-0.5 text-[10.5px] font-mono text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer Plate */}
      <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0E0E0E] flex items-center justify-between text-[11px] font-mono text-white/50">
        <span className="text-[#FF5510] font-bold tracking-tight">
          ARGANDHI.SPECIMEN
        </span>
        <span>SURABAYA // 2024–2026</span>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const [settings, brands, services] = await Promise.all([
    getSiteSettings(),
    getBrands(),
    getServices(),
  ]);

  const brandName = settings.brand_name || 'Argandhi.';
  const aboutBio =
    settings.about_description ||
    "I'm Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. Rooted in early web design training at MAN 2 Kota Madiun and Informatics Engineering at UNESA ('24), I currently advance in the Next-Gen AI Engineer cohort at Asah led by Dicoding (supported by GoTo) while shipping commercial web and mobile software.";

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      {/* =====================================================================
          1. CLEAN OBSIDIAN TOP NAVIGATION + MAGAZINE ISSUE DATELINE
      ===================================================================== */}
      <div className="pt-7 px-6 sm:px-12">
        <PublicNavbar
          brandName={brandName}
          ctaUrl="/#contact"
          isSubPage
          surfaceVariant="obsidian"
        />

        <div className="w-full max-w-[1140px] mx-auto pt-8">
          <Reveal variant="hairline">
            <div className="h-px w-full bg-white/[0.1]" />
          </Reveal>
          <Reveal variant="fade-up" delay={120}>
            <div className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7A7A]">
              <span>ISSUE 01 // PROFILE &amp; ARCHITECTURE</span>
              <span className="text-white/75">
                INFORMATICS UNESA &apos;24 &bull; ASAH BY DICODING &amp; GOTO
              </span>
              <span className="hidden sm:inline text-[#FF5510]">
                NEXT-GEN AI ENGINEER
              </span>
            </div>
          </Reveal>
          <Reveal variant="hairline" delay={180}>
            <div className="h-px w-full bg-white/[0.08]" />
          </Reveal>
        </div>
      </div>

      {/* =====================================================================
          2. PRINT-MAGAZINE EDITORIAL MASTHEAD (SPACIOUS TYPOGRAPHY + PORTRAIT)
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-14 sm:pt-20 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left 7 Columns: Spacious Editorial Typography */}
          <div className="lg:col-span-7 space-y-10 pt-2">
            <div className="space-y-6">
              <Reveal variant="fade-up" delay={80}>
                <p className="text-[12px] font-mono uppercase tracking-[0.22em] text-[#FF5510]">
                  01 / BIOGRAPHY
                </p>
              </Reveal>

              <Reveal variant="mask-up" delay={200}>
                <h1 className="text-white font-bold text-[46px] sm:text-[68px] lg:text-[80px] leading-[0.94] tracking-[-0.04em]">
                  Engineering{' '}
                  <br />
                  With Clarity<span className="text-[#FF5510]">.</span>
                </h1>
              </Reveal>
            </div>

            <Reveal variant="fade-up" delay={340}>
              <p className="text-white/80 text-[17px] sm:text-[19.5px] leading-[1.65] tracking-[-0.01em] max-w-xl font-normal">
                {aboutBio}
              </p>
            </Reveal>

            {/* Clean Hairline Colophon Facts */}
            <Reveal variant="fade-up" delay={460}>
              <div className="pt-8 border-t border-white/[0.1] grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7A7A] block">
                    University &amp; Foundation
                  </span>
                  <p className="text-white font-semibold text-[14.5px] leading-[1.45]">
                    Universitas Negeri Surabaya (&apos;24)
                    <br />
                    <span className="text-white/65 font-normal">
                      S1 Teknik Informatika &bull; Alum MAN 2 Kota Madiun
                    </span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#FF5510] block">
                    Ongoing Cohort
                  </span>
                  <p className="text-white font-semibold text-[14.5px] leading-[1.45]">
                    Asah led by Dicoding (GoTo)
                    <br />
                    <span className="text-white/65 font-normal">
                      Next-Gen AI Engineer Learning Path
                    </span>
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={560}>
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <PillButton href="/projects" variant="orange">
                  Explore Selected Works
                </PillButton>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white/75 hover:text-white transition"
                >
                  <span>Initiate a project brief</span>
                  <ArrowUpRight className="w-4 h-4 text-[#FF5510]" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right 5 Columns: Tall Editorial Portrait Frame with Slow Curtain & Parallax */}
          <Reveal
            variant="curtain-up"
            delay={260}
            className="lg:col-span-5"
          >
            <EditorialMonographPortrait
              heroImageUrl={settings.hero_image_url}
              brandName={brandName}
            />
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          3. SCROLL-SCRUBBED EDITORIAL PHILOSOPHY PULL-QUOTE
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-20 sm:py-28 border-t border-white/[0.09]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Reveal variant="fade-up" className="lg:col-span-3">
            <span className="text-[12px] font-mono uppercase tracking-[0.22em] text-[#FF5510] block">
              02 / THESIS
            </span>
            <p className="text-[#7A7A7A] text-[12.5px] mt-2 leading-[1.5]">
              Guiding principle behind every repository &amp; release.
            </p>
          </Reveal>

          <div className="lg:col-span-9">
            <ScrollTextReveal
              text="I believe great engineering reads like clean editorial prose — deliberate structure, zero unnecessary noise, resilient security boundaries, and motion that respects human perception."
              highlightWords={[
                'deliberate',
                'structure',
                'zero',
                'resilient',
                'security',
                'motion',
              ]}
              className="text-[28px] sm:text-[42px] lg:text-[50px]"
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. MAGAZINE HAIRLINE INDEX — EXPERIENCE, COHORT, ACADEMIC & VOCATIONAL ROOTS
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-20 sm:py-24 border-t border-white/[0.09] space-y-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <Reveal variant="fade-up" className="space-y-3">
            <span className="text-[12px] font-mono uppercase tracking-[0.22em] text-[#FF5510] block">
              03 / EXPERIENCE &amp; EDUCATION
            </span>
            <h2 className="text-white font-bold text-[34px] sm:text-[46px] leading-[1.06] tracking-[-0.03em]">
              Pathway &amp; Practice
            </h2>
          </Reveal>

          <Reveal variant="fade-up" delay={140}>
            <p className="text-[#7A7A7A] text-[13px] max-w-xs leading-[1.55]">
              From early vocational web design in Madiun &amp; Malang to Informatics Engineering at UNESA and Next-Gen AI Engineering with Dicoding &amp; GoTo.
            </p>
          </Reveal>
        </div>

        {/* Clean Print-Magazine Horizontal Rows */}
        <div>
          {EDITORIAL_JOURNEY.map((item, idx) => (
            <div key={item.role}>
              <Reveal variant="hairline" delay={idx * 70}>
                <div className="h-px w-full bg-white/[0.1]" />
              </Reveal>
              <Reveal
                variant="fade-up"
                delay={90 + idx * 90}
                className="py-10 sm:py-11 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start group"
              >
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] font-mono font-semibold tracking-[0.14em] text-[#FF5510] block">
                      {item.period}
                    </span>
                    {item.badge && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5510]/15 border border-[#FF5510]/35 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5510]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510]" />
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[12.5px] text-[#7A7A7A] block">
                    {item.place}
                  </span>
                </div>

                <div className="md:col-span-4">
                  <h3 className="text-white font-bold text-[20px] sm:text-[23px] leading-[1.22] tracking-[-0.025em] group-hover:text-[#FF5510] transition-colors duration-500">
                    {item.role}
                  </h3>
                </div>

                <div className="md:col-span-5">
                  <p className="text-white/72 text-[14.5px] leading-[1.75]">
                    {item.summary}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
          <Reveal variant="hairline">
            <div className="h-px w-full bg-white/[0.1]" />
          </Reveal>
        </div>

        {/* Clean Numbered Disciplines Strip from CMS Services */}
        {services.length > 0 && (
          <div className="pt-4 space-y-6">
            <Reveal variant="fade-up">
              <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                CORE ENGINEERING CAPABILITIES
              </span>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              {services.map((svc, idx) => (
                <Reveal
                  key={svc.id}
                  variant="fade-up"
                  delay={idx * 110}
                  className="pt-4 border-t border-white/[0.12] flex items-baseline justify-between gap-4 group"
                >
                  <span className="text-white font-semibold text-[16px] tracking-[-0.015em] group-hover:text-[#FF5510] transition-colors">
                    {svc.title}
                  </span>
                  <span className="text-[12px] font-mono font-bold text-[#FF5510] shrink-0">
                    {svc.number_label}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          5. STICKY SPLIT EDITORIAL ESSAY — ARCHITECTURAL STANDARDS
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-20 sm:py-28 border-t border-white/[0.09]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Sticky Editorial Heading */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
            <Reveal variant="fade-up">
              <span className="text-[12px] font-mono uppercase tracking-[0.22em] text-[#FF5510] block">
                04 / STANDARDS
              </span>
            </Reveal>
            <Reveal variant="mask-up" delay={120}>
              <h2 className="text-white font-bold text-[34px] sm:text-[44px] leading-[1.06] tracking-[-0.03em]">
                How Every System Is Built
              </h2>
            </Reveal>
            <Reveal variant="fade-up" delay={220}>
              <p className="text-white/65 text-[14px] leading-[1.65]">
                Four non-negotiable engineering invariants applied from initial schema design to production deployment.
              </p>
            </Reveal>
          </div>

          {/* Right Spacious Numbered Editorial Chapters */}
          <div className="lg:col-span-8">
            {ARCHITECTURAL_STANDARDS.map((item, idx) => (
              <div key={item.num}>
                <Reveal variant="hairline" delay={idx * 80}>
                  <div className="h-px w-full bg-white/[0.1]" />
                </Reveal>
                <Reveal
                  variant="fade-up"
                  delay={100 + idx * 110}
                  className="py-9 sm:py-11 flex flex-col sm:flex-row gap-5 sm:gap-10 items-start group"
                >
                  <span className="text-[28px] sm:text-[34px] font-bold leading-none tracking-[-0.04em] text-white/25 group-hover:text-[#FF5510] transition-colors duration-500 shrink-0 font-mono">
                    {item.num}
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-[21px] sm:text-[24px] leading-[1.2] tracking-[-0.02em]">
                      {item.title}
                    </h3>
                    <p className="text-white/72 text-[14.5px] sm:text-[15px] leading-[1.75] max-w-xl">
                      {item.detail}
                    </p>
                  </div>
                </Reveal>
              </div>
            ))}
            <Reveal variant="hairline">
              <div className="h-px w-full bg-white/[0.1]" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. MINIMALIST COLOPHON INDEX — TECHNOLOGIES & ECOSYSTEM
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-16 pb-24 border-t border-white/[0.09] space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <Reveal variant="fade-up" className="space-y-2">
            <span className="text-[12px] font-mono uppercase tracking-[0.22em] text-[#FF5510] block">
              05 / PRODUCTION TOOLKIT
            </span>
            <h2 className="text-white font-bold text-[28px] sm:text-[38px] leading-[1.08] tracking-[-0.03em]">
              Technologies &amp; Ecosystem
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={140}>
            <span className="text-[12px] font-mono text-[#7A7A7A]">
              [{String(brands.length).padStart(2, '0')} VERIFIED TOOLS]
            </span>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 border-t border-l border-white/[0.09]">
          {brands.map((brand, idx) => (
            <Reveal
              key={brand.id}
              variant="fade-up"
              delay={idx * 65}
              className="border-r border-b border-white/[0.09] px-5 py-6 flex items-center justify-between gap-3 group hover:bg-white/[0.025] transition-colors duration-500"
            >
              <div className="flex items-center gap-3 min-w-0">
                <TechLogo
                  name={brand.name}
                  monochrome
                  className="h-4 w-4 text-white/80 group-hover:text-[#FF5510] transition-colors shrink-0"
                />
                <span className="text-[14px] font-semibold text-white/90 group-hover:text-white truncate">
                  {brand.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/25 group-hover:text-[#FF5510] transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =====================================================================
          7. SIGNATURE FIERY BOOKEND FOOTER WITH CURTAIN UNVEIL
      ===================================================================== */}
      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
