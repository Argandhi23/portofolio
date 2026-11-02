import type { Service } from '@/types/database.types';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';

interface ServicesProcessSectionProps {
  services: Service[];
  ctaUrl?: string;
}

function getServiceDetails(title: string, index: number): {
  description: string;
  deliverables: string[];
} {
  const lower = title.toLowerCase();

  if (lower.includes('web')) {
    return {
      description:
        'Building ultra-fast, SEO-ready web applications, SaaS dashboards, and custom CMS platforms using Next.js App Router, TypeScript, and Supabase.',
      deliverables: ['Next.js & React Apps', 'Supabase & PostgreSQL', 'Admin CMS & Auth RLS'],
    };
  }

  if (lower.includes('mobile') || lower.includes('apk') || lower.includes('flutter')) {
    return {
      description:
        'Developing responsive, native-grade Android APKs and cross-platform mobile apps with clean architecture, offline resilience, and smooth 60fps UI.',
      deliverables: ['Flutter Mobile Apps', 'Production APK Releases', 'REST & Realtime Sync'],
    };
  }

  if (lower.includes('ai') || lower.includes('data') || lower.includes('intelligence')) {
    return {
      description:
        'Integrating LLM workflows, intelligent automation, and data-driven features into business applications to eliminate repetitive manual operations.',
      deliverables: ['AI API & Agent Workflows', 'Smart Data Pipelines', 'Automated Processing'],
    };
  }

  if (lower.includes('ui') || lower.includes('ux') || lower.includes('design') || lower.includes('maint')) {
    return {
      description:
        'Crafting high-contrast modern interfaces paired with long-term code maintainability, caching optimization, and security hardening.',
      deliverables: ['Design Systems & Tailwind', 'Performance & Caching', 'Continuous Maintenance'],
    };
  }

  const fallbacks = [
    {
      description:
        'End-to-end architecture and full-stack implementation tailored for reliability, clean code, and seamless user experience.',
      deliverables: ['System Architecture', 'Clean TypeScript', 'Scalable Deployment'],
    },
    {
      description:
        'Cross-platform application delivery focused on intuitive interaction, responsive layouts, and robust backend connectivity.',
      deliverables: ['Responsive Interfaces', 'API Integration', 'Production Testing'],
    },
    {
      description:
        'Modern automation and intelligent software engineering designed to streamline workflows and scale effortlessly.',
      deliverables: ['Workflow Automation', 'Cloud Functions', 'Security Guardrails'],
    },
    {
      description:
        'Long-term product refinement, UI polish, and performance tuning so digital systems stay fast and dependable.',
      deliverables: ['UI/UX Refinement', 'Speed Optimization', 'Technical Support'],
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
          {/* 2-Column Folioblox Section Header */}
          <SectionHeader
            eyebrow="Capabilities & Services"
            heading={
              <>
                From System Architecture
                <br />
                to Polished Deployment
              </>
            }
            lead={
              <>
                Combining academic rigor in Informatics Engineering (UNESA
                &apos;24) with hands-on freelance delivery across web, mobile,
                and AI systems.
              </>
            }
            microLabel={
              <>
                Need Custom Software
                <br />
                or Technical Consultation?
              </>
            }
            ctaHref={ctaUrl}
            ctaLabel="Discuss your scope"
          />

          {/* 4-Column Services Cards (#181818, rounded-[24px]) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc, idx) => {
              const { hash, digits } = splitNumber(svc.number_label);
              const details = getServiceDetails(svc.title, idx);

              return (
                <Reveal key={svc.id} variant="curtain-up" delay={idx * 140} className="h-full">
                  <SpotlightCard className="h-full rounded-[24px] bg-[#181818] border border-white/[0.06] hover:border-[#FF5510]/35 p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex items-center justify-center rounded-full bg-[#121212] border border-white/[0.07] px-3.5 py-1 text-[13px] font-bold tracking-tight">
                        <span className="text-[#FF5510]">{hash}</span>
                        <span className="text-white">{digits}</span>
                      </div>

                      <h3 className="text-white font-bold text-[19px] leading-[1.25] tracking-[-0.02em] group-hover:text-[#FF5510] transition-colors">
                        {svc.title}
                      </h3>

                      <p className="text-white/70 text-[13px] leading-[1.6]">
                        {details.description}
                      </p>
                    </div>

                    <ul className="relative z-10 space-y-2 pt-4 border-t border-white/[0.06]">
                      {details.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[12px] font-medium text-white/85"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510] shrink-0" />
                          <span>{item}</span>
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
