'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GsapSplitText } from '@/components/motion/GsapSplitText';
import { T } from '@/components/public/LanguageProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
    num: '01',
    periodEn: 'Active',
    periodId: 'Aktif',
    titleEn: 'AI Engineer Cohort — Asah Program',
    titleId: 'Cohort AI Engineer — Program Asah',
    org: 'Dicoding & GoTo (Industry Scholarship)',
    isActive: true,
  },
  {
    num: '02',
    periodEn: '2024 — Present',
    periodId: '2024 — Sekarang',
    titleEn: 'B.Sc. Informatics Engineering',
    titleId: 'S1 Teknik Informatika',
    org: 'Universitas Negeri Surabaya (UNESA)',
  },
  {
    num: '03',
    periodEn: '2021 — 2024',
    periodId: '2021 — 2024',
    titleEn: 'Vocational Web Design Track',
    titleId: 'Kelas Keterampilan Desain Web',
    org: 'MAN 2 Kota Madiun',
  },
];

export function EditorialIdentityCards() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const lines = container.querySelectorAll<HTMLElement>('[data-edu-line]');
      const rows = container.querySelectorAll<HTMLElement>('[data-edu-row]');

      gsap.fromTo(
        lines,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
          },
        }
      );

      gsap.fromTo(
        rows,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Heading & Context */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#9E1B32] block">
            <GsapSplitText>
              <T en="Education & Background" id="Pendidikan & Latar Belakang" />
            </GsapSplitText>
          </span>

          <h3
            style={{ color: 'var(--sec-fg, #0D0D0D)' }}
            className="font-bold text-[24px] sm:text-[30px] leading-[1.15] tracking-[-0.025em]"
          >
            <GsapSplitText>
              <T
                en="Academic & Applied Training"
                id="Pendidikan & Pelatihan Terapan"
              />
            </GsapSplitText>
          </h3>

          <p
            style={{ color: 'var(--sec-muted, #57504A)' }}
            className="text-[14.5px] leading-[1.65]"
          >
            <GsapSplitText stagger={0.015}>
              <T
                en="Combining university computer science fundamentals at UNESA with intensive applied AI engineering and technical design training."
                id="Memadukan fondasi akademik Teknik Informatika di UNESA dengan beasiswa pelatihan AI terapan industri dan keterampilan teknis."
              />
            </GsapSplitText>
          </p>

          <div className="pt-2">
            <Link
              href="/about"
              style={{ color: 'var(--sec-fg, #0D0D0D)' }}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold hover:!text-[#9E1B32] transition-colors"
            >
              <span>
                <T
                  en="View full profile & timeline"
                  id="Lihat profil & perjalanan lengkap"
                />
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#9E1B32]" />
            </Link>
          </div>
        </div>

        {/* Right Column: Minimalist Editorial Education Rows */}
        <div className="lg:col-span-7">
          <div
            data-edu-line
            style={{
              backgroundColor: 'var(--sec-divider, rgba(13, 13, 13, 0.14))',
            }}
            className="h-[1px] w-full origin-left"
          />
          {EDUCATION_ROWS.map((row) => (
            <div key={row.titleEn}>
              <div
                data-edu-row
                className="py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-[12px] font-mono text-[#9E1B32] shrink-0">
                    {row.num}
                  </span>
                  <div className="space-y-0.5">
                    <p
                      style={{ color: 'var(--sec-fg, #0D0D0D)' }}
                      className="font-semibold text-[16px] tracking-[-0.015em]"
                    >
                      <T en={row.titleEn} id={row.titleId} />
                    </p>
                    <p
                      style={{ color: 'var(--sec-muted, #57504A)' }}
                      className="text-[13px]"
                    >
                      {row.org}
                    </p>
                  </div>
                </div>

                <span
                  style={
                    row.isActive
                      ? undefined
                      : { color: 'var(--sec-muted, #57504A)' }
                  }
                  className={`text-[12px] font-mono shrink-0 pl-8 sm:pl-0 ${
                    row.isActive ? 'text-[#9E1B32] font-semibold' : ''
                  }`}
                >
                  <T en={row.periodEn} id={row.periodId} />
                </span>
              </div>
              <div
                data-edu-line
                style={{
                  backgroundColor: 'var(--sec-divider, rgba(13, 13, 13, 0.14))',
                }}
                className="h-[1px] w-full origin-left"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
