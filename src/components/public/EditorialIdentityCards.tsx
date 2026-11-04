import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ScrollPerspectiveCard } from '@/components/motion/ScrollPerspectiveCard';
import { T } from '@/components/public/LanguageProvider';

interface EducationRow {
  num: string;
  periodEn: string;
  periodId: string;
  titleEn: string;
  titleId: string;
  org: string;
  isActive?: boolean;
}

const EDUCATION_ROWS: EducationRow[] = [
  {
    num: '#01',
    periodEn: 'Active',
    periodId: 'Aktif',
    titleEn: 'AI Engineer Cohort — Asah Program',
    titleId: 'Cohort AI Engineer — Program Asah',
    org: 'Dicoding & GoTo (Industry Scholarship)',
    isActive: true,
  },
  {
    num: '#02',
    periodEn: '2024 — Present',
    periodId: '2024 — Sekarang',
    titleEn: 'B.Sc. Informatics Engineering',
    titleId: 'S1 Teknik Informatika',
    org: 'Universitas Negeri Surabaya (UNESA)',
  },
  {
    num: '#03',
    periodEn: '2021 — 2024',
    periodId: '2021 — 2024',
    titleEn: 'Vocational Web Design Track',
    titleId: 'Kelas Keterampilan Desain Web',
    org: 'MAN 2 Kota Madiun',
  },
];

export function EditorialIdentityCards() {
  return (
    <ScrollPerspectiveCard className="w-full" intensity={0.9}>
      <div
        style={{
          backgroundColor: 'var(--sec-card-bg, #121212)',
          borderColor: 'var(--sec-card-border, rgba(255, 255, 255, 0.08))',
        }}
        className="w-full rounded-[28px] border p-6 sm:p-8 lg:p-11 shadow-[0_24px_60px_rgba(0,0,0,0.08)]"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#9E1B32] block">
              <T en="Education & Background" id="Pendidikan & Latar Belakang" />
            </span>

            <h3
              style={{ color: 'var(--sec-fg, #ffffff)' }}
              className="font-bold text-[22px] sm:text-[26px] leading-[1.2] tracking-[-0.02em]"
            >
              <T
                en="Academic & Applied Training"
                id="Pendidikan & Pelatihan Terapan"
              />
            </h3>

            <p
              style={{ color: 'var(--sec-muted, rgba(255, 255, 255, 0.65))' }}
              className="text-[13.5px] leading-[1.6]"
            >
              <T
                en="Combining university computer science fundamentals at UNESA with intensive applied AI engineering and technical design training."
                id="Memadukan fondasi akademik Teknik Informatika di UNESA dengan beasiswa pelatihan AI terapan industri dan keterampilan teknis."
              />
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                style={{ color: 'var(--sec-fg, #ffffff)' }}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:!text-[#9E1B32] transition-colors"
              >
                <span>
                  <T en="View full profile & timeline" id="Lihat profil & perjalanan lengkap" />
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E1B32]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Editorial Education Rows */}
          <div
            style={{
              borderColor: 'var(--sec-divider, rgba(255, 255, 255, 0.08))',
            }}
            className="lg:col-span-7 border-t"
          >
            {EDUCATION_ROWS.map((row) => (
              <div
                key={row.titleEn}
                style={{
                  borderColor: 'var(--sec-divider, rgba(255, 255, 255, 0.08))',
                }}
                className="py-4.5 border-b flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4"
              >
                <div className="flex items-baseline gap-3.5">
                  <span className="text-[12px] font-mono font-bold text-[#9E1B32] shrink-0">
                    {row.num}
                  </span>
                  <div className="space-y-0.5">
                    <p
                      style={{ color: 'var(--sec-fg, #ffffff)' }}
                      className="font-bold text-[15px] tracking-[-0.01em]"
                    >
                      <T en={row.titleEn} id={row.titleId} />
                    </p>
                    <p
                      style={{ color: 'var(--sec-muted, #7A7A7A)' }}
                      className="text-[12.5px]"
                    >
                      {row.org}
                    </p>
                  </div>
                </div>

                <span
                  style={
                    row.isActive
                      ? undefined
                      : { color: 'var(--sec-muted, rgba(255, 255, 255, 0.5))' }
                  }
                  className={`text-[11.5px] font-mono shrink-0 pl-8 sm:pl-0 ${
                    row.isActive ? 'text-[#9E1B32] font-bold' : ''
                  }`}
                >
                  <T en={row.periodEn} id={row.periodId} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollPerspectiveCard>
  );
}
