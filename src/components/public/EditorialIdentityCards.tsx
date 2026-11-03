import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { T } from '@/components/public/LanguageProvider';

interface EducationRow {
  periodEn: string;
  periodId: string;
  titleEn: string;
  titleId: string;
  org: string;
  isActive?: boolean;
}

const EDUCATION_ROWS: EducationRow[] = [
  {
    periodEn: 'Active',
    periodId: 'Aktif',
    titleEn: 'AI Engineer Cohort — Asah Program',
    titleId: 'Cohort AI Engineer — Program Asah',
    org: 'Dicoding & GoTo (Industry Scholarship)',
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
    periodEn: '2021 — 2024',
    periodId: '2021 — 2024',
    titleEn: 'Vocational Web Design Track',
    titleId: 'Kelas Keterampilan Desain Web',
    org: 'MAN 2 Kota Madiun',
  },
];

export function EditorialIdentityCards() {
  return (
    <Reveal variant="curtain-up" delay={0} className="w-full">
      <SpotlightCard className="w-full rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-white/[0.14] p-6 sm:p-8 lg:p-10 transition-all duration-300">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#7A7A7A] block">
              <T en="Education & Background" id="Pendidikan & Latar Belakang" />
            </span>

            <h3 className="text-white font-bold text-[22px] sm:text-[26px] leading-[1.2] tracking-[-0.02em]">
              <T
                en="Academic & Applied Training"
                id="Pendidikan & Pelatihan Terapan"
              />
            </h3>

            <p className="text-white/60 text-[13.5px] leading-[1.6]">
              <T
                en="Combining university computer science fundamentals at UNESA with intensive applied AI engineering and technical design training."
                id="Memadukan fondasi akademik Teknik Informatika di UNESA dengan beasiswa pelatihan AI terapan industri dan keterampilan teknis."
              />
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/80 hover:text-[#FF5510] transition-colors"
              >
                <span>
                  <T en="View full profile & timeline" id="Lihat profil & perjalanan lengkap" />
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Education List */}
          <div className="lg:col-span-7 divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {EDUCATION_ROWS.map((row) => (
              <div
                key={row.titleEn}
                className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4"
              >
                <div className="space-y-0.5">
                  <p className="text-white font-semibold text-[14.5px] tracking-[-0.01em]">
                    <T en={row.titleEn} id={row.titleId} />
                  </p>
                  <p className="text-[#7A7A7A] text-[12.5px]">{row.org}</p>
                </div>

                <span
                  className={`text-[11.5px] font-mono shrink-0 ${
                    row.isActive ? 'text-[#FF5510] font-medium' : 'text-white/45'
                  }`}
                >
                  <T en={row.periodEn} id={row.periodId} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}
