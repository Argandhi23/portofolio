import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Globe, Smartphone } from 'lucide-react';
import type { ProjectSummary } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { formatDisplayDomain, isMobileProject } from '@/lib/utils';
import { SectionHeader } from '@/components/public/SectionHeader';
import { CmsText, T } from '@/components/public/LanguageProvider';
import { ParallaxMedia } from '@/components/motion/ParallaxMedia';
import { ScrollPerspectiveCard } from '@/components/motion/ScrollPerspectiveCard';
import { StickyProjectCard } from '@/components/motion/StickyProjectStack';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { Github } from '@/components/ui/Icons';

interface SelectedWorksSectionProps {
  projects: ProjectSummary[];
  ctaUrl?: string;
}

interface BrowserPreviewFrameProps {
  src?: string | null;
  alt: string;
  domain: string;
  isLive?: boolean;
  isMobile?: boolean;
  slug?: string;
  sizes: string;
  priority?: boolean;
}

function BrowserPreviewFrame({
  src,
  alt,
  domain,
  isLive = false,
  isMobile = false,
  slug,
  sizes,
  priority = false,
}: BrowserPreviewFrameProps) {
  return (
    <div className="w-full rounded-[18px] overflow-hidden border border-white/[0.1] bg-[#0B0B0B] shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex flex-col">
      <div className="h-8 shrink-0 bg-[#111111] border-b border-white/[0.07] px-3.5 flex items-center justify-between">
        {isMobile ? (
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#9E1B32]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9E1B32]">
              Mobile APK
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/85" />
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-0.5 max-w-[200px]">
          {isMobile ? (
            <>
              <Smartphone className="w-2.5 h-2.5 text-[#9E1B32] shrink-0" />
              <span className="text-[10px] font-mono text-white/65 truncate">
                {slug ? `${slug}.apk` : 'app.apk'}
              </span>
            </>
          ) : (
            <>
              {isLive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
              <span className="text-[10.5px] font-mono text-white/65 truncate">
                {domain}
              </span>
            </>
          )}
        </div>

        <div className="w-9" />
      </div>

      <ParallaxMedia
        intensity={0}
        className="aspect-[16/10] w-full bg-[#141414]"
        innerClassName="relative h-full w-full"
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            sizes={sizes}
            unoptimized={src.startsWith('data:') || src.endsWith('.svg')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#7A7A7A] text-xs font-medium">
            Preview
          </div>
        )}
      </ParallaxMedia>
    </div>
  );
}

export function SelectedWorksSection({
  projects,
}: SelectedWorksSectionProps) {
  const featured = projects.filter((p) => p.is_featured);
  const primaryProjects =
    featured.length > 0 ? featured.slice(0, 3) : projects.slice(0, 3);
  const primaryIds = new Set(primaryProjects.map((p) => p.id));
  const moreProjects = projects.filter((p) => !primaryIds.has(p.id));

  return (
    <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-20 sm:py-28 space-y-16">
      <SectionHeader
        eyebrow={<T en="Projects" id="Proyek" />}
        heading={<T en="Featured Projects" id="Proyek Pilihan" />}
        lead={
          <T
            en="Real-world web apps, mobile APKs, and systems shipped to production."
            id="Aplikasi web, APK mobile, dan sistem nyata di produksi."
          />
        }
        ctaHref="/projects"
        ctaLabel={<T en="All projects" id="Semua proyek" />}
      />

      {/* AWWWARDS STICKY CARD STACK (#01 -> #02 -> #03) */}
      {primaryProjects.length > 0 ? (
        <div className="relative">
          {primaryProjects.map((project, index) => {
            const numDigits = String(index + 1).padStart(2, '0');
            const domain = formatDisplayDomain(project.project_url, project.slug);
            const cleanAlt = pickLocalized(project.title, 'en');

            return (
              <StickyProjectCard
                key={project.id}
                index={index}
                total={primaryProjects.length}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="relative z-10 group grid grid-cols-1 lg:grid-cols-12"
                >
                  <div className="lg:col-span-7 bg-gradient-to-br from-[#181818] via-[#121212] to-[#0C0C0C] p-3.5 sm:p-6 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.07]">
                    <BrowserPreviewFrame
                      src={project.thumbnail_url}
                      alt={cleanAlt}
                      domain={domain}
                      isLive={Boolean(project.project_url)}
                      isMobile={isMobileProject(project)}
                      slug={project.slug}
                      sizes="(max-width: 1024px) 100vw, 640px"
                      priority={index === 0}
                    />
                  </div>

                  <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2.5">
                          <span className="inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.1] px-3 py-1 text-[13px] font-mono font-bold tracking-tight">
                            <span className="text-[#E04D70]">#</span>
                            <span className="text-white">{numDigits}</span>
                          </span>
                          <span className="text-[12.5px] font-semibold text-[#E04D70]">
                            <CmsText value={project.category} />
                          </span>
                        </div>

                        <span className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] group-hover:bg-[#9E1B32] group-hover:border-[#9E1B32] text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-12 shrink-0">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-[26px] sm:text-[32px] leading-[1.12] tracking-[-0.03em] group-hover:text-[#E04D70] transition-colors">
                        <CmsText value={project.title} />
                      </h3>

                      {project.summary && (
                        <p className="text-white/78 text-[14px] sm:text-[15px] leading-[1.62] line-clamp-3">
                          <CmsText value={project.summary} />
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 pt-2">
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.tech_stack.slice(0, 6).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-black/35 border border-white/[0.09] px-3 py-1 text-[11px] font-medium text-white/90"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3.5 pt-4 border-t border-white/[0.09] text-[12px] text-white/80">
                        {project.project_url && (
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#E04D70]" />
                            <span>{domain}</span>
                          </span>
                        )}
                        {project.apk_url && (
                          <span className="inline-flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-[#E04D70]" />
                            <span>APK</span>
                          </span>
                        )}
                        {project.github_url && (
                          <span className="inline-flex items-center gap-1.5">
                            <Github className="w-3.5 h-3.5 text-white/80" />
                            <span>Code</span>
                          </span>
                        )}
                        <span className="ml-auto font-semibold text-white group-hover:text-[#E04D70] transition-colors">
                          <T en="View case study" id="Lihat detail" /> &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </StickyProjectCard>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] bg-[#121212] border border-white/[0.07] p-12 text-center space-y-2">
          <p className="text-white font-semibold text-[15px]">
            <T
              en="Projects coming soon"
              id="Daftar proyek sedang disiapkan"
            />
          </p>
          <p className="text-[#7A7A7A] text-[13px]">
            <T
              en="Publish projects from the Admin Panel to display them here."
              id="Publikasikan proyek dari Panel Admin untuk menampilkannya di sini."
            />
          </p>
        </div>
      )}

      {moreProjects.length > 0 && (
        <div className="relative z-20 space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <p className="text-white font-semibold text-[15px] tracking-[-0.01em]">
              <T en="More Projects" id="Proyek Lainnya" />{' '}
              <span className="text-[#9E1B32] ml-1">({moreProjects.length})</span>
            </p>
            <Link
              href="/projects"
              className="text-xs font-semibold text-white/70 hover:text-[#9E1B32] transition"
            >
              <T en="View all" id="Lihat semua" /> &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {moreProjects.slice(0, 6).map((project, idx) => {
              const numDigits = String(primaryProjects.length + idx + 1).padStart(
                2,
                '0'
              );
              const cleanAlt = pickLocalized(project.title, 'en');
              return (
                <ScrollPerspectiveCard
                  key={project.id}
                  intensity={0.85}
                  className="h-full"
                >
                  <SpotlightCard className="h-full rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#9E1B32]/45 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="relative z-10 group flex flex-col h-full"
                    >
                      <div className="relative aspect-[16/10] w-full bg-[#181818] overflow-hidden border-b border-white/[0.06]">
                        {project.thumbnail_url && (
                          <Image
                            src={project.thumbnail_url}
                            alt={cleanAlt}
                            fill
                            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 360px"
                            unoptimized={
                              project.thumbnail_url.startsWith('data:') ||
                              project.thumbnail_url.endsWith('.svg')
                            }
                          />
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold">
                              <span className="text-[#9E1B32]">#</span>
                              <span className="text-white">{numDigits}</span>
                            </span>
                            <span className="text-[#9E1B32] font-medium text-[11.5px]">
                              <CmsText value={project.category} />
                            </span>
                          </div>

                          <h4 className="text-white font-bold text-[17px] leading-[1.25] tracking-[-0.015em] group-hover:text-[#9E1B32] transition-colors">
                            <CmsText value={project.title} />
                          </h4>
                        </div>

                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.tech_stack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full bg-[#181818] border border-white/[0.06] px-2.5 py-0.5 text-[10.5px] text-white/70"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </SpotlightCard>
                </ScrollPerspectiveCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
