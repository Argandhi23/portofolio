import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { T } from '@/components/public/LanguageProvider';
import { TechLogo } from '@/components/ui/TechLogos';

interface TrackRow {
  periodEn: string;
  periodId: string;
  titleEn: string;
  titleId: string;
  org: string;
  isActive?: boolean;
}

const TRACK_ROWS: TrackRow[] = [
  {
    periodEn: 'CURRENT',
    periodId: 'AKTIF',
    titleEn: 'AI Engineer Cohort — Asah Program',
    titleId: 'Cohort AI Engineer — Program Asah',
    org: 'Dicoding & GoTo',
    isActive: true,
  },
  {
    periodEn: "COHORT '24",
    periodId: "ANGKATAN '24",
    titleEn: 'B.Sc. Informatics Engineering',
    titleId: 'S1 Teknik Informatika',
    org: 'Universitas Negeri Surabaya (UNESA)',
  },
  {
    periodEn: '2024 — PRESENT',
    periodId: '2024 — SEKARANG',
    titleEn: 'Freelance Software Developer',
    titleId: 'Freelance Software Developer',
    org: 'Surabaya, ID · Web, CMS & Mobile APK',
  },
];

interface StandardPillar {
  labelEn: string;
  labelId: string;
  detailEn: string;
  detailId: string;
}

const ENGINEERING_PILLARS: StandardPillar[] = [
  {
    labelEn: 'Server-First & Fast Caching',
    labelId: 'Server-First & Caching Cepat',
    detailEn: 'Instant page loads with Next.js App Router and on-demand cache revalidation.',
    detailId: 'Muatan halaman instan dengan Next.js App Router dan revalidasi cache otomatis.',
  },
  {
    labelEn: 'Strict Data & Auth Security',
    labelId: 'Keamanan Data & Autentikasi Ketat',
    detailEn: 'Defense-in-depth using PostgreSQL Row Level Security (RLS) and Zod validation.',
    detailId: 'Proteksi berlapis menggunakan PostgreSQL RLS dan validasi skema Zod.',
  },
  {
    labelEn: 'Clean, Maintainable Delivery',
    labelId: 'Kode Rapi & Mudah Dikelola',
    detailEn: 'Modular TypeScript codebase paired with custom admin CMS and Android APK builds.',
    detailId: 'Struktur TypeScript modular dengan CMS Admin kustom dan rilis APK Android.',
  },
];

const CORE_TOOLKIT = [
  'Next.js',
  'TypeScript',
  'Supabase',
  'PostgreSQL',
  'Flutter',
  'Python',
  'Tailwind CSS',
] as const;

export function EditorialIdentityCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
      {/* =====================================================================
          CARD #01: BACKGROUND & ACADEMIC / COHORT TRACK (7 COLUMNS)
      ===================================================================== */}
      <Reveal variant="curtain-up" delay={0} className="lg:col-span-7 h-full">
        <SpotlightCard className="h-full rounded-[28px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-6 sm:p-8 flex flex-col justify-between gap-7 transition-all duration-300 shadow-2xl">
          <div className="relative z-10 space-y-6">
            {/* Top Header Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center rounded-full bg-[#181818] border border-white/[0.07] px-3 py-1 text-[12.5px] font-bold tracking-tight">
                  <span className="text-[#FF5510]">#</span>
                  <span className="text-white">01</span>
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7A7A7A]">
                  <T en="Background" id="Perjalanan" />
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] border border-white/[0.07] px-3 py-1 text-[11.5px] font-medium text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510]" />
                <span>Surabaya, ID</span>
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h3 className="text-white font-bold text-[22px] sm:text-[25px] leading-[1.18] tracking-[-0.025em]">
                <T
                  en="Education & Active Track"
                  id="Pendidikan & Fokus Saat Ini"
                />
              </h3>
              <p className="text-white/70 text-[13.5px] leading-[1.6]">
                <T
                  en="Combining formal computer science foundations with hands-on client work and applied AI training."
                  id="Memadukan fondasi akademik Teknik Informatika dengan pengerjaan proyek nyata dan pelatihan AI terapan."
                />
              </p>
            </div>

            {/* Structured Track List */}
            <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {TRACK_ROWS.map((row) => (
                <div
                  key={row.titleEn}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-[14.5px] tracking-[-0.01em]">
                        <T en={row.titleEn} id={row.titleId} />
                      </p>
                      {row.isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5510]/15 border border-[#FF5510]/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF5510]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510]" />
                          <T en={row.periodEn} id={row.periodId} />
                        </span>
                      )}
                    </div>
                    <p className="text-[#7A7A7A] text-[12.5px]">{row.org}</p>
                  </div>

                  {!row.isActive && (
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/50 shrink-0">
                      <T en={row.periodEn} id={row.periodId} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Link */}
          <div className="relative z-10 flex items-center justify-between pt-1">
            <span className="text-[12px] text-[#7A7A7A]">
              Faqih Rafasha Argandhi
            </span>
            <Link
              href="/about"
              className="group/link inline-flex items-center gap-2 text-[13px] font-semibold text-white hover:text-[#FF5510] transition-colors"
            >
              <span>
                <T en="Full profile & timeline" id="Profil & perjalanan lengkap" />
              </span>
              <span className="w-7 h-7 rounded-full bg-[#181818] border border-white/[0.08] group-hover/link:bg-[#FF5510] group-hover/link:border-[#FF5510] text-white flex items-center justify-center transition-all duration-300">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </SpotlightCard>
      </Reveal>

      {/* =====================================================================
          CARD #02: ENGINEERING APPROACH & STANDARDS (5 COLUMNS)
      ===================================================================== */}
      <Reveal variant="curtain-up" delay={120} className="lg:col-span-5 h-full">
        <SpotlightCard className="h-full rounded-[28px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300 shadow-2xl">
          <div className="relative z-10 space-y-6">
            {/* Top Header Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center rounded-full bg-[#181818] border border-white/[0.07] px-3 py-1 text-[12.5px] font-bold tracking-tight">
                  <span className="text-[#FF5510]">#</span>
                  <span className="text-white">02</span>
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7A7A7A]">
                  <T en="How I Work" id="Cara Kerja" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h3 className="text-white font-bold text-[22px] sm:text-[25px] leading-[1.18] tracking-[-0.025em]">
                <T
                  en="Built for Real Production"
                  id="Standar Siap Produksi"
                />
              </h3>
              <p className="text-white/70 text-[13.5px] leading-[1.6]">
                <T
                  en="Every project is structured to stay fast for users and easy to manage long after launch."
                  id="Setiap proyek dirancang agar tetap ringan diakses pengunjung dan mudah dikelola untuk jangka panjang."
                />
              </p>
            </div>

            {/* 3 Engineering Pillars */}
            <div className="space-y-2.5">
              {ENGINEERING_PILLARS.map((pillar) => (
                <div
                  key={pillar.labelEn}
                  className="rounded-[18px] bg-[#181818] border border-white/[0.06] px-4 py-3 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510] shrink-0" />
                    <p className="text-white font-semibold text-[13.5px] tracking-[-0.01em]">
                      <T en={pillar.labelEn} id={pillar.labelId} />
                    </p>
                  </div>
                  <p className="text-white/65 text-[12px] leading-[1.5] pl-3.5">
                    <T en={pillar.detailEn} id={pillar.detailId} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </Reveal>

      {/* =====================================================================
          CARD #03: CORE TOOLKIT & DIRECT PROJECT SHORTCUT (12 COLUMNS)
      ===================================================================== */}
      <Reveal variant="curtain-up" delay={220} className="lg:col-span-12">
        <SpotlightCard className="rounded-[28px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/35 p-6 sm:px-8 sm:py-6 transition-all duration-300 shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="inline-flex items-center gap-2.5 shrink-0">
                <span className="inline-flex items-center justify-center rounded-full bg-[#181818] border border-white/[0.07] px-3 py-1 text-[12.5px] font-bold tracking-tight">
                  <span className="text-[#FF5510]">#</span>
                  <span className="text-white">03</span>
                </span>
                <span className="text-white font-bold text-[16px] tracking-[-0.015em]">
                  <T en="Core Stack" id="Teknologi Utama" />
                </span>
              </div>

              <span
                aria-hidden="true"
                className="hidden sm:inline-block h-4 w-px bg-white/[0.1]"
              />

              <p className="text-white/65 text-[13px]">
                <T
                  en="Primary tools used across web apps, custom CMS, and mobile APKs."
                  id="Perangkat utama untuk membangun aplikasi web, CMS, dan APK mobile."
                />
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CORE_TOOLKIT.map((tech) => (
                <div
                  key={tech}
                  className="inline-flex items-center gap-2 rounded-full bg-[#181818] border border-white/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-white/85"
                >
                  <TechLogo
                    name={tech}
                    monochrome
                    className="w-3.5 h-3.5 text-[#FF5510] shrink-0"
                  />
                  <span>{tech}</span>
                </div>
              ))}

              <a
                href="#projects"
                className="group/proj inline-flex items-center gap-1.5 rounded-full bg-[#FF5510]/12 hover:bg-[#FF5510] border border-[#FF5510]/30 hover:border-[#FF5510] px-3.5 py-1.5 text-[12px] font-semibold text-[#FF5510] hover:text-white transition-all duration-300"
              >
                <span>
                  <T en="See work" id="Lihat karya" />
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </SpotlightCard>
      </Reveal>
    </div>
  );
}
