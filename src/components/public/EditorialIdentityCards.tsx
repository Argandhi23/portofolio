import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { T } from '@/components/public/LanguageProvider';

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
    periodEn: 'Active',
    periodId: 'Aktif',
    titleEn: 'AI Engineer Cohort',
    titleId: 'Cohort AI Engineer',
    org: 'Dicoding & GoTo (Asah Program)',
    isActive: true,
  },
  {
    periodEn: '2024 — Present',
    periodId: '2024 — Sekarang',
    titleEn: 'B.Sc. Informatics Engineering',
    titleId: 'S1 Teknik Informatika',
    org: 'Universitas Negeri Surabaya (UNESA)',
  },
  {
    periodEn: '2024 — Present',
    periodId: '2024 — Sekarang',
    titleEn: 'Freelance Software Developer',
    titleId: 'Freelance Software Developer',
    org: 'Web Apps, CMS & Mobile APK',
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
    labelEn: 'Clean, Maintainable Code',
    labelId: 'Kode Bersih & Mudah Dikelola',
    detailEn: 'Modular TypeScript codebase paired with custom admin CMS and native builds.',
    detailId: 'Struktur TypeScript modular dengan CMS Admin kustom dan rilis APK.',
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
          CARD #01: BACKGROUND & TRACK (6 COLUMNS)
      ===================================================================== */}
      <Reveal variant="curtain-up" delay={0} className="lg:col-span-6 h-full">
        <SpotlightCard className="h-full rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-white/[0.14] p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300">
          <div className="relative z-10 space-y-6">
            {/* Top Header Row */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[#7A7A7A]">
              <span>
                01 / <T en="Background" id="Latar Belakang" />
              </span>
              <span className="text-white/40">Surabaya, ID</span>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h3 className="text-white font-bold text-[21px] sm:text-[23px] leading-[1.2] tracking-[-0.02em]">
                <T
                  en="Education & Active Track"
                  id="Pendidikan & Fokus Saat Ini"
                />
              </h3>
              <p className="text-white/60 text-[13px] leading-[1.6]">
                <T
                  en="Combining computer science foundations with client-facing production projects and applied AI training."
                  id="Memadukan fondasi Teknik Informatika dengan pengerjaan proyek nyata dan pelatihan AI terapan."
                />
              </p>
            </div>

            {/* Structured Track List */}
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {TRACK_ROWS.map((row) => (
                <div
                  key={row.titleEn}
                  className="py-3.5 flex items-baseline justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-white font-medium text-[14px] tracking-[-0.01em]">
                      <T en={row.titleEn} id={row.titleId} />
                    </p>
                    <p className="text-[#7A7A7A] text-[12px]">{row.org}</p>
                  </div>

                  <span
                    className={`text-[11px] font-mono shrink-0 ${
                      row.isActive ? 'text-[#FF5510] font-medium' : 'text-white/40'
                    }`}
                  >
                    <T en={row.periodEn} id={row.periodId} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Link */}
          <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/[0.06]">
            <span className="text-[12px] text-white/40">
              Faqih Rafasha Argandhi
            </span>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/80 hover:text-[#FF5510] transition-colors"
            >
              <span>
                <T en="Full profile & timeline" id="Profil & perjalanan lengkap" />
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </SpotlightCard>
      </Reveal>

      {/* =====================================================================
          CARD #02: HOW I WORK (6 COLUMNS)
      ===================================================================== */}
      <Reveal variant="curtain-up" delay={120} className="lg:col-span-6 h-full">
        <SpotlightCard className="h-full rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-white/[0.14] p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300">
          <div className="relative z-10 space-y-6">
            {/* Top Header Row */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[#7A7A7A]">
              <span>
                02 / <T en="Approach" id="Pendekatan" />
              </span>
              <span className="text-white/40">Production Standards</span>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h3 className="text-white font-bold text-[21px] sm:text-[23px] leading-[1.2] tracking-[-0.02em]">
                <T
                  en="Built for Real Production"
                  id="Standar Siap Produksi"
                />
              </h3>
              <p className="text-white/60 text-[13px] leading-[1.6]">
                <T
                  en="Every project is structured to stay fast for users and easy to maintain long after launch."
                  id="Setiap proyek dirancang agar tetap cepat bagi pengunjung dan mudah dirawat untuk jangka panjang."
                />
              </p>
            </div>

            {/* 3 Clean Engineering Pillars (no nested boxes, no glowing dots) */}
            <div className="space-y-4 pt-1">
              {ENGINEERING_PILLARS.map((pillar) => (
                <div key={pillar.labelEn} className="space-y-1">
                  <h4 className="text-white font-medium text-[13.5px] tracking-[-0.01em]">
                    <T en={pillar.labelEn} id={pillar.labelId} />
                  </h4>
                  <p className="text-white/55 text-[12px] leading-relaxed">
                    <T en={pillar.detailEn} id={pillar.detailId} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/[0.06] text-[12px] text-white/40">
            <span>Engineering Discipline</span>
            <span>Zero-Bloat</span>
          </div>
        </SpotlightCard>
      </Reveal>

      {/* =====================================================================
          CARD #03: CORE TOOLKIT (12 COLUMNS SLIM BAR)
      ===================================================================== */}
      <Reveal variant="curtain-up" delay={200} className="lg:col-span-12">
        <SpotlightCard className="rounded-[20px] bg-[#121212] border border-white/[0.07] hover:border-white/[0.14] px-6 py-4 sm:px-8 sm:py-5 transition-all duration-300">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#7A7A7A] shrink-0">
                03 / <T en="Core Stack" id="Teknologi" />
              </span>
              <span className="h-3 w-px bg-white/[0.1] hidden sm:inline-block" />
              <p className="text-white/50 text-[12px] hidden sm:block">
                <T
                  en="Primary tools used across web apps and mobile builds."
                  id="Perangkat utama untuk aplikasi web dan build mobile."
                />
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12.5px]">
              {CORE_TOOLKIT.map((tech, i) => (
                <span key={tech} className="inline-flex items-center gap-2">
                  <span className="text-white/80 font-medium">{tech}</span>
                  {i < CORE_TOOLKIT.length - 1 && (
                    <span className="text-white/20 select-none">·</span>
                  )}
                </span>
              ))}

              <a
                href="#projects"
                className="ml-auto sm:ml-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#FF5510] hover:text-white transition-colors"
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
