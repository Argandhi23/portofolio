import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  getBrands,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PillButton } from '@/components/public/PillButton';
import { FooterBookend } from '@/components/public/FooterBookend';
import {
  CmsText,
  LocalizedScrollTextReveal,
  T,
} from '@/components/public/LanguageProvider';
import { Reveal } from '@/components/motion/Reveal';
import { TechLogo } from '@/components/ui/TechLogos';

export const metadata: Metadata = {
  title: 'About — Argandhi.',
  description:
    'Faqih Rafasha Argandhi — Full-Stack Developer, UNESA Informatics student, and Asah AI Engineer cohort.',
};

interface BilingualJourneyEntry {
  periodEn: string;
  periodId: string;
  roleEn: string;
  roleId: string;
  place: string;
  badgeEn?: string;
  badgeId?: string;
  summaryEn: string;
  summaryId: string;
}

const EDITORIAL_JOURNEY: BilingualJourneyEntry[] = [
  {
    periodEn: 'CURRENT',
    periodId: 'SEKARANG',
    roleEn: 'AI Engineer Cohort — Asah Program',
    roleId: 'Cohort AI Engineer — Program Asah',
    place: 'Dicoding & GoTo',
    badgeEn: 'Active',
    badgeId: 'Aktif',
    summaryEn:
      'Intensive scholarship focused on Python, Machine Learning, Generative AI, and real-world AI capstone delivery.',
    summaryId:
      'Program beasiswa intensif berfokus pada Python, Machine Learning, Generative AI, dan proyek capstone industri.',
  },
  {
    periodEn: '2024 — PRESENT',
    periodId: '2024 — SEKARANG',
    roleEn: 'Freelance Software Developer',
    roleId: 'Freelance Software Developer',
    place: 'Surabaya, ID',
    summaryEn:
      'Building production web stores, custom CMS dashboards, and cross-platform Flutter Android APKs.',
    summaryId:
      'Membangun toko online produksi, dashboard CMS kustom, dan aplikasi Android APK berbasis Flutter.',
  },
  {
    periodEn: "2024 — COHORT '24",
    periodId: "2024 — ANGKATAN '24",
    roleEn: 'B.Sc. Informatics Engineering',
    roleId: 'S1 Teknik Informatika',
    place: 'Universitas Negeri Surabaya (UNESA)',
    summaryEn:
      'Studying algorithms, database systems, software security, and applied AI.',
    summaryId:
      'Mendalami struktur data, sistem basis data, keamanan perangkat lunak, dan AI terapan.',
  },
  {
    periodEn: 'INTERNSHIP',
    periodId: 'MAGANG (PKL)',
    roleEn: 'Web Design & IT Intern',
    roleId: 'Magang Desain Web & IT (PKL)',
    place: 'LPK Singosari · Malang',
    summaryEn:
      'Two-month hands-on field internship building practical web layouts and client assignments.',
    summaryId:
      'Praktik kerja lapangan dua bulan mengerjakan desain antarmuka web dan proyek praktis.',
  },
  {
    periodEn: 'HIGH SCHOOL',
    periodId: 'MADRASAH ALIYAH',
    roleEn: 'Vocational Web Design Track',
    roleId: 'Kelas Keterampilan Desain Web',
    place: 'MAN 2 Kota Madiun',
    summaryEn:
      'Early foundation in front-end layouting, web design, and digital multimedia.',
    summaryId:
      'Fondasi awal pemrograman antarmuka, desain web, dan multimedia digital.',
  },
];

function EditorialMonographPortrait() {
  return (
    <div className="relative rounded-[28px] overflow-hidden border border-white/[0.12] bg-[#121212] shadow-[0_30px_70px_rgba(0,0,0,0.8)] flex flex-col justify-between">
      <div className="h-10 shrink-0 bg-[#171717] border-b border-white/[0.08] px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
        </div>
        <span className="text-[11.5px] font-mono text-white/65">
          profile.ts
        </span>
        <span className="h-2 w-2 rounded-full bg-[#9E1B32]" />
      </div>

      <div className="p-6 sm:p-7 space-y-5 font-mono text-[12.5px] leading-[1.7]">
        <div className="space-y-1 text-white/80">
          <p>
            <span className="text-[#9E1B32]">const</span>{' '}
            <span className="text-white font-semibold">developer</span> = &#123;
          </p>
          <div className="pl-4 space-y-1">
            <p>
              <span className="text-white/45">name:</span>{' '}
              <span className="text-[#E6E6E6]">&apos;Faqih Rafasha Argandhi&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">role:</span>{' '}
              <span className="text-[#9E1B32]">&apos;Software Developer&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">base:</span>{' '}
              <span className="text-[#E6E6E6]">&apos;Surabaya, ID&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">study:</span>{' '}
              <span className="text-[#E6E6E6]">&apos;UNESA \&apos;24 (Informatics)&apos;</span>,
            </p>
            <p>
              <span className="text-white/45">cohort:</span>{' '}
              <span className="text-white font-semibold">&apos;Asah AI (Dicoding &amp; GoTo)&apos;</span>,
            </p>
          </div>
          <p>&#125;;</p>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap gap-1.5">
          {['Next.js', 'TypeScript', 'Supabase', 'Flutter', 'Python AI'].map((tag) => (
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
  );
}

export default async function AboutPage() {
  const [settings, brands] = await Promise.all([
    getSiteSettings(),
    getBrands(),
  ]);

  const brandName = settings.brand_name || 'Argandhi.';

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#9E1B32] selection:text-white">
      {/* 1. TOP NAVIGATION */}
      <div className="pt-7 px-6 sm:px-12">
        <PublicNavbar
          brandName={brandName}
          ctaUrl="/#contact"
          isSubPage
          surfaceVariant="obsidian"
        />
      </div>

      {/* 2. BIOGRAPHY MASTHEAD */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-14 sm:pt-20 pb-18 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          <div className="lg:col-span-7 space-y-8 pt-2">
            <div className="space-y-4">
              <Reveal variant="fade-up" delay={80}>
                <p className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#9E1B32]">
                  <T en="About" id="Tentang" />
                </p>
              </Reveal>

              <Reveal variant="mask-up" delay={200}>
                <h1 className="text-white font-bold text-[46px] sm:text-[68px] lg:text-[78px] leading-[0.95] tracking-[-0.04em]">
                  <T
                    en={
                      <>
                        Engineering{' '}
                        <br />
                        With Clarity<span className="text-[#9E1B32]">.</span>
                      </>
                    }
                    id={
                      <>
                        Membangun{' '}
                        <br />
                        Dengan Jelas<span className="text-[#9E1B32]">.</span>
                      </>
                    }
                  />
                </h1>
              </Reveal>
            </div>

            <Reveal variant="fade-up" delay={340}>
              <p className="text-white/80 text-[16.5px] sm:text-[18.5px] leading-[1.65] tracking-[-0.01em] max-w-xl font-normal">
                <CmsText
                  value={settings.about_description}
                  fallbackEn="Full-Stack Developer in Surabaya turning ideas into fast, reliable web and mobile apps."
                  fallbackId="Full-Stack Developer di Surabaya yang mengubah ide menjadi aplikasi web & mobile cepat."
                />
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={460}>
              <div className="pt-7 border-t border-white/[0.1] grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7A7A] block">
                    <T en="Education" id="Pendidikan" />
                  </span>
                  <p className="text-white font-semibold text-[14.5px]">
                    UNESA (&apos;24) &mdash;{' '}
                    <span className="text-white/70 font-normal">
                      <T en="Informatics" id="Informatika" />
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#9E1B32] block">
                    Cohort
                  </span>
                  <p className="text-white font-semibold text-[14.5px]">
                    Asah (Dicoding &amp; GoTo) &mdash;{' '}
                    <span className="text-white/70 font-normal">AI</span>
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={560}>
              <div className="flex flex-wrap items-center gap-5 pt-1">
                <PillButton href="/projects" variant="orange">
                  <T en="View Projects" id="Lihat Proyek" />
                </PillButton>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white/75 hover:text-white transition"
                >
                  <span>
                    <T en="Contact me" id="Hubungi saya" />
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#9E1B32]" />
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal
            variant="curtain-up"
            delay={260}
            className="lg:col-span-5"
          >
            <EditorialMonographPortrait />
          </Reveal>
        </div>
      </section>

      {/* 3. CONCISE SCROLL-SCRUBBED QUOTE */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-16 sm:py-22 border-t border-white/[0.09]">
        <LocalizedScrollTextReveal
          enText="Good software is simple, fast, and built to last."
          idText="Software yang baik itu simpel, cepat, dan tahan lama."
          enHighlights={['simple', 'fast', 'last']}
          idHighlights={['simpel', 'cepat', 'lama']}
          className="text-[28px] sm:text-[42px] lg:text-[50px]"
        />
      </section>

      {/* 4. EXPERIENCE & EDUCATION */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-18 sm:py-22 border-t border-white/[0.09] space-y-12">
        <Reveal variant="fade-up" className="space-y-2">
          <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#9E1B32] block">
            <T en="Background" id="Perjalanan" />
          </span>
          <h2 className="text-white font-bold text-[32px] sm:text-[42px] leading-[1.08] tracking-[-0.03em]">
            <T en="Experience & Education" id="Pengalaman & Pendidikan" />
          </h2>
        </Reveal>

        <div>
          {EDITORIAL_JOURNEY.map((item, idx) => (
            <div key={item.roleEn}>
              <Reveal variant="hairline" delay={idx * 70}>
                <div className="h-px w-full bg-white/[0.1]" />
              </Reveal>
              <Reveal
                variant="fade-up"
                delay={90 + idx * 90}
                className="py-8 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start group"
              >
                <div className="md:col-span-3 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] font-mono font-semibold tracking-[0.14em] text-[#9E1B32] block">
                      <T en={item.periodEn} id={item.periodId} />
                    </span>
                    {item.badgeEn && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9E1B32]/15 border border-[#9E1B32]/35 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#9E1B32]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9E1B32]" />
                        <T
                          en={item.badgeEn}
                          id={item.badgeId || item.badgeEn}
                        />
                      </span>
                    )}
                  </div>
                  <span className="text-[12.5px] text-[#7A7A7A] block">
                    {item.place}
                  </span>
                </div>

                <div className="md:col-span-4">
                  <h3 className="text-white font-bold text-[19px] sm:text-[21px] leading-[1.24] tracking-[-0.02em] group-hover:text-[#9E1B32] transition-colors duration-500">
                    <T en={item.roleEn} id={item.roleId} />
                  </h3>
                </div>

                <div className="md:col-span-5">
                  <p className="text-white/72 text-[14px] leading-[1.65]">
                    <T en={item.summaryEn} id={item.summaryId} />
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
          <Reveal variant="hairline">
            <div className="h-px w-full bg-white/[0.1]" />
          </Reveal>
        </div>
      </section>

      {/* 5. TECH STACK GRID */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-16 pb-24 border-t border-white/[0.09] space-y-10">
        <Reveal variant="fade-up">
          <h2 className="text-white font-bold text-[28px] sm:text-[36px] leading-[1.08] tracking-[-0.03em]">
            Tech Stack
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 border-t border-l border-white/[0.09]">
          {brands.map((brand, idx) => (
            <Reveal
              key={brand.id}
              variant="fade-up"
              delay={idx * 65}
              className="border-r border-b border-white/[0.09] px-5 py-5 flex items-center justify-between gap-3 group hover:bg-white/[0.025] transition-colors duration-500"
            >
              <div className="flex items-center gap-3 min-w-0">
                <TechLogo
                  name={brand.name}
                  monochrome
                  className="h-4 w-4 text-white/80 group-hover:text-[#9E1B32] transition-colors shrink-0"
                />
                <span className="text-[14px] font-semibold text-white/90 group-hover:text-white truncate">
                  {brand.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/25 group-hover:text-[#9E1B32] transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. FOOTER BOOKEND */}
      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
