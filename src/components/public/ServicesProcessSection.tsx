'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Service } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { SectionHeader } from '@/components/public/SectionHeader';
import { GsapSplitText } from '@/components/motion/GsapSplitText';
import { CmsText, T } from '@/components/public/LanguageProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

function getServiceDetails(
  rawTitle: string,
  index: number
): BilingualServiceDetail {
  const lower = pickLocalized(rawTitle, 'en').toLowerCase();

  if (lower.includes('web')) {
    return {
      descEn: 'Fast, scalable web apps and custom CMS dashboards.',
      descId: 'Aplikasi web cepat dan dashboard CMS kustom.',
      tagsEn: ['Next.js', 'Supabase', 'Admin CMS'],
      tagsId: ['Next.js', 'Supabase', 'Admin CMS'],
    };
  }

  if (
    lower.includes('mobile') ||
    lower.includes('apk') ||
    lower.includes('flutter')
  ) {
    return {
      descEn: 'Smooth cross-platform mobile apps and Android APKs.',
      descId: 'Aplikasi mobile responsif dan rilis APK Android.',
      tagsEn: ['Flutter', 'Android APK', 'Realtime API'],
      tagsId: ['Flutter', 'APK Android', 'API Realtime'],
    };
  }

  if (
    lower.includes('ui') ||
    lower.includes('ux') ||
    lower.includes('design') ||
    lower.includes('maint')
  ) {
    return {
      descEn: 'Clean interfaces, speed tuning, and ongoing support.',
      descId: 'Antarmuka bersih, optimasi kecepatan, dan pemeliharaan.',
      tagsEn: ['Tailwind UI', 'Caching', 'Maintenance'],
      tagsId: ['Tailwind UI', 'Caching', 'Pemeliharaan'],
    };
  }

  if (
    /\bai\b/.test(lower) ||
    lower.includes('data') ||
    lower.includes('intelligence')
  ) {
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

function cleanDigits(label: string): string {
  return label.trim().replace(/^#/, '');
}

/**
 * Minimalist Editorial Services Index (#services).
 * Full-width typographic rows with GSAP hairline dividers (`scaleX: 0 -> 1`)
 * and masked word-by-word text animations (`GsapSplitText`).
 */
export function ServicesProcessSection({
  services,
  ctaUrl = '#contact',
}: ServicesProcessSectionProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || services.length === 0) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const lines = list.querySelectorAll<HTMLElement>('[data-service-line]');
      const rows = list.querySelectorAll<HTMLElement>('[data-service-row]');

      gsap.fromTo(
        lines,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: list,
            start: 'top 85%',
          },
        }
      );

      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 90%',
            },
          }
        );
      });
    }, list);

    return () => {
      ctx.revert();
    };
  }, [services.length]);

  return (
    <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-22 sm:py-28 space-y-16">
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

      <div ref={listRef} className="w-full">
        <div
          data-service-line
          className="h-[1px] w-full bg-white/12 origin-left will-change-transform"
        />

        {services.map((svc, idx) => {
          const digits = cleanDigits(svc.number_label);
          const details = getServiceDetails(svc.title, idx);

          return (
            <div key={svc.id} className="group">
              <div
                data-service-row
                className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-baseline transition-colors"
              >
                <div className="lg:col-span-1">
                  <span className="font-mono text-xs sm:text-sm text-[#9E1B32]">
                    {digits}
                  </span>
                </div>

                <div className="lg:col-span-4">
                  <h3 className="text-white font-bold text-[24px] sm:text-[30px] leading-[1.15] tracking-[-0.025em] group-hover:translate-x-2 transition-transform duration-300">
                    <GsapSplitText stagger={0.035}>
                      <CmsText value={svc.title} />
                    </GsapSplitText>
                  </h3>
                </div>

                <div className="lg:col-span-4">
                  <p className="text-white/70 text-[15px] leading-[1.6]">
                    <GsapSplitText stagger={0.02} delay={0.06}>
                      <T en={details.descEn} id={details.descId} />
                    </GsapSplitText>
                  </p>
                </div>

                <div className="lg:col-span-3 lg:text-right pt-1 lg:pt-0">
                  <p className="font-mono text-[12px] text-white/45">
                    {details.tagsEn.map((tagEn, tIdx) => (
                      <React.Fragment key={tagEn}>
                        <T en={tagEn} id={details.tagsId[tIdx] || tagEn} />
                        {tIdx < details.tagsEn.length - 1 ? ' / ' : ''}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>

              <div
                data-service-line
                className="h-[1px] w-full bg-white/12 origin-left will-change-transform"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
