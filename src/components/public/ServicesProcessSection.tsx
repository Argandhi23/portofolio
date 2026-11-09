'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Service } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { SectionHeader } from '@/components/public/SectionHeader';
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
 * Scroll-linked typesetting: each rule leads a staggered perspective reveal
 * across the row, followed by a restrained tonal sweep. No extra scroll pin.
 */
export function ServicesProcessSection({
  services,
  ctaUrl = '#contact',
}: ServicesProcessSectionProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || services.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, (context) => {
      if (!context.conditions?.motion) return;
      const desktop = context.conditions?.desktop;
      const rows = list.querySelectorAll<HTMLElement>('[data-service-entry]');
      rows.forEach((entry) => {
        const line = entry.querySelector('[data-service-line]');
        const cells = entry.querySelectorAll('[data-service-cell]');
        const wash = entry.querySelector('[data-service-wash]');
        gsap.timeline({
          scrollTrigger: { trigger: entry, start: 'top 92%', end: 'top 46%', scrub: 0.55 },
        })
          .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.65, ease: 'power2.inOut' }, 0)
          .fromTo(cells, {
            yPercent: desktop ? 100 : 40, rotateX: desktop ? -25 : 0,
            transformPerspective: 900, transformOrigin: '50% 100%', opacity: 0.15,
          }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: 0.09, duration: 0.75, ease: 'power3.out' }, 0.1);
        gsap.fromTo(wash, { scaleX: 0 }, {
          scaleX: 1, ease: 'none',
          scrollTrigger: { trigger: entry, start: 'top 70%', end: 'bottom 40%', scrub: 0.7 },
        });
      });
    }, list);
    return () => mm.revert();
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
        {services.map((svc, idx) => {
          const digits = cleanDigits(svc.number_label);
          const details = getServiceDetails(svc.title, idx);

          return (
            <div key={svc.id} data-service-entry className="group relative">
              <div data-service-line className="h-px w-full bg-white/15 origin-left" />
              <div data-service-wash aria-hidden="true" className="absolute inset-0 bg-white/[0.025] origin-left pointer-events-none" />
              <div
                data-service-row
                className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-baseline transition-colors"
              >
                <div className="lg:col-span-1 overflow-hidden">
                  <span data-service-cell className="inline-block font-mono text-xs sm:text-sm text-[#E04D70]">
                    {digits}
                  </span>
                </div>

                <div className="lg:col-span-4 overflow-hidden py-1">
                  <h3 data-service-cell className="text-white font-bold text-[24px] sm:text-[30px] leading-[1.15] tracking-[-0.025em]">
                    <CmsText value={svc.title} />
                  </h3>
                </div>

                <div className="lg:col-span-4 overflow-hidden py-1">
                  <p data-service-cell className="text-white/70 text-[15px] leading-[1.6]">
                    <T en={details.descEn} id={details.descId} />
                  </p>
                </div>

                <div className="lg:col-span-3 lg:text-right pt-1 lg:pt-0 overflow-hidden">
                  <p data-service-cell className="font-mono text-[12px] text-white/45">
                    {details.tagsEn.map((tagEn, tIdx) => (
                      <React.Fragment key={tagEn}>
                        <T en={tagEn} id={details.tagsId[tIdx] || tagEn} />
                        {tIdx < details.tagsEn.length - 1 ? ' / ' : ''}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-px w-full bg-white/12" />
      </div>
    </div>
  );
}
