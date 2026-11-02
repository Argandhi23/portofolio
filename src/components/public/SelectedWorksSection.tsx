import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Globe, Smartphone } from 'lucide-react';
import type { Project } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { formatDisplayDomain } from '@/lib/utils';
import { SectionHeader } from '@/components/public/SectionHeader';
import { CmsText, T } from '@/components/public/LanguageProvider';
import { Reveal } from '@/components/motion/Reveal';
import { ParallaxMedia } from '@/components/motion/ParallaxMedia';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { Github } from '@/components/ui/Icons';

interface SelectedWorksSectionProps {
  projects: Project[];
  ctaUrl?: string;
}

interface BrowserPreviewFrameProps {
  src?: string | null;
  alt: string;
  domain: string;
  isLive?: boolean;
  sizes: string;
  priority?: boolean;
}

function BrowserPreviewFrame({
  src,
  alt,
  domain,
  isLive = false,
  sizes,
  priority = false,
}: BrowserPreviewFrameProps) {
  return (
    <div className="w-full rounded-[18px] overflow-hidden border border-white/[0.1] bg-[#0B0B0B] shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex flex-col">
      <div className="h-8 shrink-0 bg-[#111111] border-b border-white/[0.07] px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/85" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-0.5 max-w-[200px]">
          {isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
          )}
          <span className="text-[10.5px] font-mono text-white/65 truncate">
            {domain}
          </span>
        </div>

        <div className="w-9" />
      </div>

      <ParallaxMedia
        intensity={18}
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
    <section
      id="projects"
      className="bg-[#080808] w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-20 sm:py-24 space-y-14"
    >
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

      {primaryProjects.length > 0 ? (
        <div className="space-y-6">
          {primaryProjects.map((project, index) => {
            const numDigits = String(index + 1).padStart(2, '0');
            const isHeroBento = index === 0 && primaryProjects.length !== 2;
            const domain = formatDisplayDomain(project.project_url, project.slug);
            const cleanAlt = pickLocalized(project.title, 'en');

            if (isHeroBento) {
              return (
                <Reveal key={project.id} variant="curtain-up">
                  <SpotlightCard className="rounded-[32px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/45 overflow-hidden transition-all duration-300 shadow-2xl">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="relative z-10 group grid grid-cols-1 lg:grid-cols-12"
                    >
                      <div className="lg:col-span-7 bg-gradient-to-br from-[#1A1A1A] via-[#141414] to-[#0E0E0E] p-3.5 sm:p-6 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                        <BrowserPreviewFrame
                          src={project.thumbnail_url}
                          alt={cleanAlt}
                          domain={domain}
                          isLive={Boolean(project.project_url)}
                          sizes="(max-width: 1024px) 100vw, 640px"
                          priority
                        />
                      </div>

                      <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between space-y-6">
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2">
                              <span className="text-[14px] font-bold tracking-tight">
                                <span className="text-[#FF5510]">#</span>
                                <span className="text-white">{numDigits}</span>
                              </span>
                              <span className="h-1 w-1 rounded-full bg-white/25" />
                              <span className="text-[12px] font-semibold text-[#FF5510]">
                                <CmsText value={project.category} />
                              </span>
                            </div>

                            <span className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] group-hover:bg-[#FF5510] group-hover:border-[#FF5510] text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-12 shrink-0">
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          </div>

                          <h3 className="text-white font-bold text-[24px] sm:text-[28px] leading-[1.16] tracking-[-0.025em] group-hover:text-[#FF5510] transition-colors">
                            <CmsText value={project.title} />
                          </h3>

                          {project.summary && (
                            <p className="text-white/72 text-[13.5px] leading-[1.6] line-clamp-3">
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
                                  className="rounded-full bg-[#181818] border border-white/[0.07] px-3 py-1 text-[11px] font-medium text-white/85"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.tech_stack.length > 6 && (
                                <span className="rounded-full bg-[#181818] border border-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-[#7A7A7A]">
                                  +{project.tech_stack.length - 6}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-3.5 pt-4 border-t border-white/[0.07] text-[12px] text-white/75">
                            {project.project_url && (
                              <span className="inline-flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-[#FF5510]" />
                                <span>{domain}</span>
                              </span>
                            )}
                            {project.apk_url && (
                              <span className="inline-flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-[#FF5510]" />
                                <span>APK</span>
                              </span>
                            )}
                            {project.github_url && (
                              <span className="inline-flex items-center gap-1.5">
                                <Github className="w-3.5 h-3.5 text-white/80" />
                                <span>Code</span>
                              </span>
                            )}
                            <span className="ml-auto font-semibold text-white group-hover:text-[#FF5510] transition-colors">
                              <T en="View" id="Lihat" /> &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SpotlightCard>
                </Reveal>
              );
            }

            return null;
          })}

          {primaryProjects.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {primaryProjects
                .filter((_, idx) => !(idx === 0 && primaryProjects.length !== 2))
                .map((project, subIdx) => {
                  const realIndex = primaryProjects.findIndex(
                    (p) => p.id === project.id
                  );
                  const numDigits = String(realIndex + 1).padStart(2, '0');
                  const domain = formatDisplayDomain(
                    project.project_url,
                    project.slug
                  );
                  const cleanAlt = pickLocalized(project.title, 'en');

                  return (
                    <Reveal
                      key={project.id}
                      variant="curtain-up"
                      delay={subIdx * 160}
                      className="h-full"
                    >
                      <SpotlightCard className="h-full rounded-[28px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/45 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="relative z-10 group flex flex-col h-full"
                        >
                          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-3.5 sm:p-4 border-b border-white/[0.06]">
                            <BrowserPreviewFrame
                              src={project.thumbnail_url}
                              alt={cleanAlt}
                              domain={domain}
                              isLive={Boolean(project.project_url)}
                              sizes="(max-width: 768px) 100vw, 520px"
                            />
                          </div>

                          <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="inline-flex items-center gap-2">
                                  <span className="text-[13px] font-bold tracking-tight">
                                    <span className="text-[#FF5510]">#</span>
                                    <span className="text-white">{numDigits}</span>
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-white/25" />
                                  <span className="text-[12px] font-semibold text-[#FF5510]">
                                    <CmsText value={project.category} />
                                  </span>
                                </div>

                                <span className="w-8 h-8 rounded-full bg-[#181818] border border-white/[0.08] group-hover:bg-[#FF5510] group-hover:border-[#FF5510] text-white flex items-center justify-center transition-colors duration-300">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                              </div>

                              <h3 className="text-white font-bold text-[21px] sm:text-[23px] leading-[1.2] tracking-[-0.02em] group-hover:text-[#FF5510] transition-colors">
                                <CmsText value={project.title} />
                              </h3>

                              {project.summary && (
                                <p className="text-white/70 text-[13px] leading-[1.58] line-clamp-2">
                                  <CmsText value={project.summary} />
                                </p>
                              )}
                            </div>

                            <div className="space-y-3.5">
                              {project.tech_stack &&
                                project.tech_stack.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {project.tech_stack.slice(0, 4).map((tech) => (
                                      <span
                                        key={tech}
                                        className="rounded-full bg-[#181818] border border-white/[0.07] px-2.5 py-0.5 text-[11px] font-medium text-white/75"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}

                              <div className="flex items-center gap-3.5 pt-3.5 border-t border-white/[0.07] text-[11.5px] text-white/70">
                                {project.project_url && (
                                  <span className="inline-flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5 text-[#FF5510]" />
                                    <span>{domain}</span>
                                  </span>
                                )}
                                {project.apk_url && (
                                  <span className="inline-flex items-center gap-1">
                                    <Smartphone className="w-3.5 h-3.5 text-[#FF5510]" />
                                    <span>APK</span>
                                  </span>
                                )}
                                {project.github_url && (
                                  <span className="inline-flex items-center gap-1">
                                    <Github className="w-3.5 h-3.5 text-white/80" />
                                    <span>Code</span>
                                  </span>
                                )}
                                <span className="ml-auto font-semibold text-white group-hover:text-[#FF5510] transition-colors">
                                  <T en="View" id="Lihat" /> &rarr;
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </SpotlightCard>
                    </Reveal>
                  );
                })}
            </div>
          )}
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
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <p className="text-white font-semibold text-[15px] tracking-[-0.01em]">
              <T en="More Projects" id="Proyek Lainnya" />{' '}
              <span className="text-[#FF5510] ml-1">({moreProjects.length})</span>
            </p>
            <Link
              href="/projects"
              className="text-xs font-semibold text-white/70 hover:text-[#FF5510] transition"
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
                <Reveal key={project.id} variant="fade-up" delay={idx * 65}>
                  <SpotlightCard className="h-full rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 overflow-hidden transition-all duration-300 hover:-translate-y-1">
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
                              <span className="text-[#FF5510]">#</span>
                              <span className="text-white">{numDigits}</span>
                            </span>
                            <span className="text-[#FF5510] font-medium text-[11.5px]">
                              <CmsText value={project.category} />
                            </span>
                          </div>

                          <h4 className="text-white font-bold text-[17px] leading-[1.25] tracking-[-0.015em] group-hover:text-[#FF5510] transition-colors">
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
                </Reveal>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
