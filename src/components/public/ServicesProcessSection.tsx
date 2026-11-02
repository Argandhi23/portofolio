import type { Service } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { SectionHeader } from '@/components/public/SectionHeader';
import { CmsText, T } from '@/components/public/LanguageProvider';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';

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
  return (
    <section id="services" className="px-3 sm:px-6 py-6">
      <div className="bg-[#121212] rounded-[42px] border border-white/[0.07] py-18 sm:py-24 px-6 sm:px-12">
        <div className="w-full max-w-[1140px] mx-auto space-y-14">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc, idx) => {
              const { hash, digits } = splitNumber(svc.number_label);
              const details = getServiceDetails(svc.title, idx);

              return (
                <Reveal key={svc.id} variant="curtain-up" delay={idx * 140} className="h-full">
                  <SpotlightCard className="h-full rounded-[24px] bg-[#181818] border border-white/[0.06] hover:border-[#FF5510]/35 p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    <div className="relative z-10 space-y-3.5">
                      <div className="inline-flex items-center justify-center rounded-full bg-[#121212] border border-white/[0.07] px-3.5 py-1 text-[13px] font-bold tracking-tight">
                        <span className="text-[#FF5510]">{hash}</span>
                        <span className="text-white">{digits}</span>
                      </div>

                      <h3 className="text-white font-bold text-[19px] leading-[1.25] tracking-[-0.02em] group-hover:text-[#FF5510] transition-colors">
                        <CmsText value={svc.title} />
                      </h3>

                      <p className="text-white/70 text-[13px] leading-[1.58]">
                        <T en={details.descEn} id={details.descId} />
                      </p>
                    </div>

                    <ul className="relative z-10 space-y-2 pt-4 border-t border-white/[0.06]">
                      {details.tagsEn.map((tagEn, tIdx) => (
                        <li
                          key={tagEn}
                          className="flex items-center gap-2 text-[12px] font-medium text-white/85"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510] shrink-0" />
                          <span>
                            <T en={tagEn} id={details.tagsId[tIdx] || tagEn} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
