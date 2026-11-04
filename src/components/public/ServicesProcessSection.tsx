'use client';

import React, { useEffect, useRef } from 'react';
import type { Service } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import {
  clamp,
  computeWindowedScrollProgress,
  easeOutCubic,
  interpolateHexColor,
} from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { SectionHeader } from '@/components/public/SectionHeader';
import { CmsText, T } from '@/components/public/LanguageProvider';

interface ServicesProcessSectionProps {
  services: Service[];
  ctaUrl?: string;
}

interface BilingualServiceDetail {
  descEn: string;
  descId: string;
  tagsEn: string[];
  tagsId: string[];
}

function getServiceDetails(rawTitle: string, index: number): BilingualServiceDetail {
  const lower = pickLocalized(rawTitle, 'en').toLowerCase();

  if (lower.includes('web')) {
    return {
      descEn: 'Fast, scalable web apps and custom CMS dashboards.',
      descId: 'Aplikasi web cepat dan dashboard CMS kustom.',
      tagsEn: ['Next.js', 'Supabase', 'Admin CMS'],
      tagsId: ['Next.js', 'Supabase', 'Admin CMS'],
    };
  }

  if (lower.includes('mobile') || lower.includes('apk') || lower.includes('flutter')) {
    return {
      descEn: 'Smooth cross-platform mobile apps and Android APKs.',
      descId: 'Aplikasi mobile responsif dan rilis APK Android.',
      tagsEn: ['Flutter', 'Android APK', 'Realtime API'],
      tagsId: ['Flutter', 'APK Android', 'API Realtime'],
    };
  }

  if (lower.includes('ui') || lower.includes('ux') || lower.includes('design') || lower.includes('maint')) {
    return {
      descEn: 'Clean interfaces, speed tuning, and ongoing support.',
      descId: 'Antarmuka bersih, optimasi kecepatan, dan pemeliharaan.',
      tagsEn: ['Tailwind UI', 'Caching', 'Maintenance'],
      tagsId: ['Tailwind UI', 'Caching', 'Pemeliharaan'],
    };
  }

  if (/\bai\b/.test(lower) || lower.includes('data') || lower.includes('intelligence')) {
    return {
      descEn: 'Practical AI workflows and smart business automation.',
      descId: 'Integrasi fitur AI praktis dan otomasi kerja.',
      tagsEn: ['LLM API', 'Automation', 'Data Pipelines'],
      tagsId: ['API LLM', 'Otomasi', 'Data Pipeline'],
    };
  }

  const fallbacks: BilingualServiceDetail[] = [
    {
      descEn: 'Clean full-stack architecture built for reliability.',
      descId: 'Arsitektur full-stack bersih yang andal.',
      tagsEn: ['Architecture', 'TypeScript', 'Cloud'],
      tagsId: ['Arsitektur', 'TypeScript', 'Cloud'],
    },
    {
      descEn: 'Responsive cross-platform apps with smooth UX.',
      descId: 'Aplikasi lintas platform yang responsif.',
      tagsEn: ['Mobile UI', 'API Sync', 'Release'],
      tagsId: ['UI Mobile', 'Sinkron API', 'Rilis'],
    },
    {
      descEn: 'Smart software automation to speed up workflows.',
      descId: 'Otomasi cerdas untuk mempercepat alur kerja.',
      tagsEn: ['Automation', 'Backend', 'Security'],
      tagsId: ['Otomasi', 'Backend', 'Keamanan'],
    },
    {
      descEn: 'UI refinement, caching, and technical maintenance.',
      descId: 'Perapihan UI, optimasi cache, dan pemeliharaan.',
      tagsEn: ['UI/UX', 'Speed', 'Support'],
      tagsId: ['UI/UX', 'Kecepatan', 'Dukungan'],
    },
  ];

  return fallbacks[index % fallbacks.length];
}

function splitNumber(label: string): { hash: string; digits: string } {
  const trimmed = label.trim();
  if (trimmed.startsWith('#')) {
    return { hash: '#', digits: trimmed.slice(1) };
  }
  return { hash: '#', digits: trimmed };
}

export function ServicesProcessSection({
  services,
  ctaUrl = '#contact',
}: ServicesProcessSectionProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const badgeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || services.length === 0) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    let lastProgress = -1;

    return registerScrollTarget(grid, ({ rectTop, viewportHeight }) => {
      const progress = computeWindowedScrollProgress(
        rectTop,
        viewportHeight,
        0.88,
        0.18
      );

      if (Math.abs(progress - lastProgress) < 0.002) return;
      lastProgress = progress;

      const count = services.length;
      for (let i = 0; i < count; i += 1) {
        const card = cardRefs.current[i];
        const badge = badgeRefs.current[i];
        if (!card) continue;

        const start = (i / count) * 0.62;
        const localRaw = clamp((progress - start) / 0.34, 0, 1);
        const active = easeOutCubic(localRaw);

        const bg = interpolateHexColor('#151515', '#88132A', active);
        const borderAlpha = (0.07 + active * 0.48).toFixed(3);
        const liftY = (1 - active) * 28 - active * 8;
        const scale = 0.96 + active * 0.04;

        card.style.backgroundColor = bg;
        card.style.borderColor = `rgba(224, 77, 112, ${borderAlpha})`;
        card.style.transform = `translate3d(0, ${liftY.toFixed(
          1
        )}px, 0) scale(${scale.toFixed(4)})`;

        if (badge) {
          badge.style.backgroundColor = interpolateHexColor(
            '#101010',
            '#0B0204',
            active
          );
          badge.style.borderColor = `rgba(255, 255, 255, ${(
            0.08 +
            active * 0.22
          ).toFixed(3)})`;
        }

        for (let tIdx = 0; tIdx < 3; tIdx += 1) {
          const dot = dotRefs.current[i * 3 + tIdx];
          if (dot) {
            dot.style.backgroundColor = interpolateHexColor(
              '#9E1B32',
              '#FFFFFF',
              active
            );
          }
        }
      }
    });
  }, [services.length]);

  return (
    <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-22 sm:py-28 space-y-14">
      <SectionHeader
        eyebrow={<T en="Services" id="Layanan" />}
        heading={<T en="What I Build" id="Layanan Utama" />}
        lead={
          <T
            en="End-to-end development for web, mobile, and AI."
            id="Pengembangan menyeluruh untuk web, mobile, dan AI."
          />
        }
        ctaHref={ctaUrl}
        ctaLabel={<T en="Start a project" id="Mulai proyek" />}
      />

      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2"
      >
        {services.map((svc, idx) => {
          const { hash, digits } = splitNumber(svc.number_label);
          const details = getServiceDetails(svc.title, idx);

          return (
            <div
              key={svc.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="h-full rounded-[26px] bg-[#151515] border border-white/[0.07] p-6 sm:p-7 flex flex-col justify-between space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.45)] will-change-transform"
            >
              <div className="space-y-4">
                <div
                  ref={(el) => {
                    badgeRefs.current[idx] = el;
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-[#101010] border border-white/[0.08] px-3.5 py-1 text-[13px] font-mono font-bold tracking-tight"
                >
                  <span className="text-[#E04D70]">{hash}</span>
                  <span className="text-white">{digits}</span>
                </div>

                <h3 className="text-white font-bold text-[20px] leading-[1.22] tracking-[-0.02em]">
                  <CmsText value={svc.title} />
                </h3>

                <p className="text-white/85 text-[13.5px] leading-[1.58]">
                  <T en={details.descEn} id={details.descId} />
                </p>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-white/15">
                {details.tagsEn.map((tagEn, tIdx) => (
                  <li
                    key={tagEn}
                    className="flex items-center gap-2.5 text-[12.5px] font-semibold text-white/95"
                  >
                    <span
                      ref={(el) => {
                        dotRefs.current[idx * 3 + tIdx] = el;
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#9E1B32] shrink-0"
                    />
                    <span>
                      <T en={tagEn} id={details.tagsId[tIdx] || tagEn} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
