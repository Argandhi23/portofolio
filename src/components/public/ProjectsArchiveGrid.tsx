'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  Globe,
  LayoutGrid,
  List,
  Search,
  Smartphone,
} from 'lucide-react';
import type { ProjectSummary } from '@/types/database.types';
import { pickLocalized } from '@/lib/i18n/localized';
import { formatDisplayDomain, isMobileProject } from '@/lib/utils';
import { useLanguage } from '@/components/public/LanguageProvider';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { Reveal } from '@/components/motion/Reveal';
import { ParallaxMedia } from '@/components/motion/ParallaxMedia';
import { ParallaxColumn } from '@/components/motion/ParallaxColumn';
import { ScrollPerspectiveCard } from '@/components/motion/ScrollPerspectiveCard';
import { Github } from '@/components/ui/Icons';

interface ProjectsArchiveGridProps {
  projects: ProjectSummary[];
}

type ViewMode = 'gallery' | 'list';

interface ArchiveBrowserFrameProps {
  project: ProjectSummary;
  alt: string;
  domain: string;
  aspectClass?: string;
  sizes: string;
  priority?: boolean;
}

function ArchiveBrowserFrame({
  project,
  alt,
  domain,
  aspectClass = 'aspect-[16/10]',
  sizes,
  priority = false,
}: ArchiveBrowserFrameProps) {
  const isMobile = isMobileProject(project);

  return (
    <div className="w-full rounded-[18px] overflow-hidden border border-white/[0.1] bg-[#0B0B0B] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
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

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-0.5 max-w-[210px]">
          {isMobile ? (
            <>
              <Smartphone className="w-2.5 h-2.5 text-[#9E1B32] shrink-0" />
              <span className="text-[10px] font-mono text-white/65 truncate">
                {project.slug}.apk
              </span>
            </>
          ) : (
            <>
              {project.project_url && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
              <span className="text-[10.5px] font-mono text-white/65 truncate">
                {domain}
              </span>
            </>
          )}
        </div>

        <div className="w-8" />
      </div>

      <ParallaxMedia
        intensity={32}
        className={`${aspectClass} w-full bg-[#141414]`}
        innerClassName="relative h-full w-full"
      >
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={alt}
            fill
            priority={priority}
            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            sizes={sizes}
            unoptimized={
              project.thumbnail_url.startsWith('data:') ||
              project.thumbnail_url.endsWith('.svg')
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#7A7A7A] text-xs">
            Preview
          </div>
        )}
      </ParallaxMedia>
    </div>
  );
}

export function ProjectsArchiveGrid({ projects }: ProjectsArchiveGridProps) {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [hoveredProject, setHoveredProject] = useState<ProjectSummary | null>(null);

  const floatingRef = useRef<HTMLDivElement | null>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        projects
          .map((p) => pickLocalized(p.category, 'en').trim())
          .filter(Boolean)
      )
    );
    return ['All', ...unique];
  }, [projects]);

  const categoryLabels = useMemo(() => {
    const map = new Map<string, string>();
    map.set('All', lang === 'id' ? 'Semua' : 'All');
    projects.forEach((p) => {
      const key = pickLocalized(p.category, 'en').trim();
      if (key) {
        map.set(key, pickLocalized(p.category, lang).trim());
      }
    });
    return map;
  }, [projects, lang]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const catEn = pickLocalized(project.category, 'en').trim().toLowerCase();
      const matchCat =
        selectedCategory === 'All' ||
        catEn === selectedCategory.toLowerCase();
      if (!matchCat) return false;
      if (!q) return true;

      const titleLoc = pickLocalized(project.title, lang).toLowerCase();
      const catLoc = pickLocalized(project.category, lang).toLowerCase();
      const sumLoc = pickLocalized(project.summary, lang).toLowerCase();

      return (
        titleLoc.includes(q) ||
        catLoc.includes(q) ||
        sumLoc.includes(q) ||
        project.tech_stack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, selectedCategory, query, lang]);

  const startFloatingLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const step = () => {
      const el = floatingRef.current;
      if (!el) {
        rafRef.current = null;
        return;
      }

      currentPos.current.x +=
        (targetPos.current.x - currentPos.current.x) * 0.14;
      currentPos.current.y +=
        (targetPos.current.y - currentPos.current.y) * 0.14;

      el.style.transform = `translate3d(${currentPos.current.x.toFixed(
        1
      )}px, ${currentPos.current.y.toFixed(1)}px, 0)`;

      if (
        Math.abs(targetPos.current.x - currentPos.current.x) > 0.4 ||
        Math.abs(targetPos.current.y - currentPos.current.y) > 0.4
      ) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = window.requestAnimationFrame(step);
  }, []);

  const handleListPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return;
      targetPos.current.x = e.clientX + 26;
      targetPos.current.y = e.clientY - 115;
      startFloatingLoop();
    },
    [startFloatingLoop]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const leadProject = filteredProjects[0];
  const remainingProjects = filteredProjects.slice(1);
  const leftColumnProjects = remainingProjects.filter((_, i) => i % 2 === 0);
  const rightColumnProjects = remainingProjects.filter((_, i) => i % 2 === 1);

  const renderGalleryCard = (
    project: ProjectSummary,
    realIndex: number,
    tallVariant: boolean
  ) => {
    const numDigits = String(realIndex + 1).padStart(2, '0');
    const domain = formatDisplayDomain(project.project_url, project.slug);
    const titleLoc = pickLocalized(project.title, lang);
    const catLoc = pickLocalized(project.category, lang);
    const summaryLoc = pickLocalized(project.summary, lang);

    return (
      <ScrollPerspectiveCard
        key={project.id}
        intensity={0.95}
      >
        <SpotlightCard className="rounded-[30px] bg-[#121212] border border-white/[0.07] hover:border-[#9E1B32]/45 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 shadow-2xl">
          <Link
            href={`/projects/${project.slug}`}
            className="relative z-10 group flex flex-col h-full"
          >
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0E0E0E] p-3.5 sm:p-5 border-b border-white/[0.06]">
              <ArchiveBrowserFrame
                project={project}
                alt={titleLoc}
                domain={domain}
                aspectClass={
                  tallVariant ? 'aspect-[16/11.4]' : 'aspect-[16/9.8]'
                }
                sizes="(max-width: 768px) 100vw, 520px"
              />
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2.5">
                    <span className="text-[13px] font-mono font-bold tracking-tight">
                      <span className="text-[#9E1B32]">#</span>
                      <span className="text-white">{numDigits}</span>
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span className="text-[12px] font-semibold text-[#9E1B32]">
                      {catLoc}
                    </span>
                  </div>

                  <span className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] group-hover:bg-[#9E1B32] group-hover:border-[#9E1B32] text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-12">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                <h2 className="text-white font-bold text-[22px] sm:text-[25px] leading-[1.18] tracking-[-0.025em] group-hover:text-[#9E1B32] transition-colors">
                  {titleLoc}
                </h2>

                {summaryLoc && (
                  <p className="text-white/70 text-[13.5px] leading-[1.6] line-clamp-2">
                    {summaryLoc}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-[#181818] border border-white/[0.07] px-3 py-0.5 text-[11px] font-medium text-white/75"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3.5 pt-4 border-t border-white/[0.07] text-[11.5px] text-white/70">
                  {project.project_url && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#9E1B32]" />
                      <span>{domain}</span>
                    </span>
                  )}
                  {project.apk_url && (
                    <span className="inline-flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-[#9E1B32]" />
                      <span>APK</span>
                    </span>
                  )}
                  {project.github_url && (
                    <span className="inline-flex items-center gap-1">
                      <Github className="w-3.5 h-3.5 text-white/80" />
                      <span>Code</span>
                    </span>
                  )}
                  <span className="ml-auto font-semibold text-white group-hover:text-[#9E1B32] transition-colors">
                    {lang === 'id' ? 'Lihat' : 'View'} &rarr;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </SpotlightCard>
      </ScrollPerspectiveCard>
    );
  };

  return (
    <div className="relative space-y-12">
      <Reveal variant="fade-up" delay={140}>
        <div className="rounded-[26px] bg-[#111111] border border-white/[0.08] p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="flex flex-wrap items-center gap-2"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#9E1B32] text-white shadow-lg shadow-[#9E1B32]/25'
                      : 'bg-[#181818] text-white/70 border border-white/[0.07] hover:text-white hover:border-white/20'
                  }`}
                >
                  {categoryLabels.get(cat) || cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
              <input
                type="search"
                aria-label="Search projects by title or tech stack"
                placeholder={lang === 'id' ? 'Cari proyek...' : 'Search projects...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full bg-[#181818] border border-white/[0.08] pl-10 pr-4 py-2 text-[12.5px] text-white placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#9E1B32] transition"
              />
            </div>

            <div
              role="group"
              aria-label="Switch archive layout view"
              className="inline-flex items-center rounded-full bg-[#181818] border border-white/[0.08] p-1 self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => {
                  setViewMode('gallery');
                  setHoveredProject(null);
                }}
                aria-pressed={viewMode === 'gallery'}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition cursor-pointer ${
                  viewMode === 'gallery'
                    ? 'bg-white text-[#080808]'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#080808]'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {filteredProjects.length === 0 ? (
        <div className="rounded-[28px] bg-[#121212] border border-white/[0.07] p-14 text-center space-y-3">
          <p className="text-white font-bold text-base">
            {lang === 'id' ? 'Proyek tidak ditemukan' : 'No matching projects'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setQuery('');
            }}
            className="mt-2 inline-flex items-center rounded-full bg-[#9E1B32] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            Reset
          </button>
        </div>
      ) : viewMode === 'gallery' ? (
        <div className="relative z-10 space-y-12">
          {leadProject && (
            <ScrollPerspectiveCard intensity={1.05}>
              <SpotlightCard className="rounded-[34px] bg-[#121212] border border-white/[0.08] hover:border-[#9E1B32]/45 overflow-hidden transition-all duration-500 shadow-2xl">
                <Link
                  href={`/projects/${leadProject.slug}`}
                  className="relative z-10 group grid grid-cols-1 lg:grid-cols-12"
                >
                  <div className="lg:col-span-7 bg-gradient-to-br from-[#1C1C1C] via-[#131313] to-[#0D0D0D] p-4 sm:p-7 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                    <ArchiveBrowserFrame
                      project={leadProject}
                      alt={pickLocalized(leadProject.title, lang)}
                      domain={formatDisplayDomain(
                        leadProject.project_url,
                        leadProject.slug
                      )}
                      sizes="(max-width: 1024px) 100vw, 660px"
                      priority
                    />
                  </div>

                  <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between space-y-8">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2.5">
                          <span className="text-[14px] font-mono font-bold tracking-tight">
                            <span className="text-[#9E1B32]">#</span>
                            <span className="text-white">01</span>
                          </span>
                          <span className="h-1 w-1 rounded-full bg-white/25" />
                          <span className="text-[12px] font-semibold text-[#9E1B32]">
                            {pickLocalized(leadProject.category, lang)}
                          </span>
                        </div>

                        <span className="w-10 h-10 rounded-full bg-[#181818] border border-white/[0.1] group-hover:bg-[#9E1B32] group-hover:border-[#9E1B32] text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-12 shrink-0">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>

                      <h2 className="text-white font-bold text-[26px] sm:text-[32px] leading-[1.12] tracking-[-0.03em] group-hover:text-[#9E1B32] transition-colors">
                        {pickLocalized(leadProject.title, lang)}
                      </h2>

                      {leadProject.summary && (
                        <p className="text-white/72 text-[14px] leading-[1.65] line-clamp-3">
                          {pickLocalized(leadProject.summary, lang)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {leadProject.tech_stack &&
                        leadProject.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {leadProject.tech_stack.slice(0, 6).map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full bg-[#181818] border border-white/[0.08] px-3 py-1 text-[11px] font-medium text-white/85"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/[0.07] text-[12px] text-white/75">
                        {leadProject.project_url && (
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#9E1B32]" />
                            <span>
                              {formatDisplayDomain(
                                leadProject.project_url,
                                leadProject.slug
                              )}
                            </span>
                          </span>
                        )}
                        {leadProject.apk_url && (
                          <span className="inline-flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-[#9E1B32]" />
                            <span>APK</span>
                          </span>
                        )}
                        {leadProject.github_url && (
                          <span className="inline-flex items-center gap-1.5">
                            <Github className="w-3.5 h-3.5 text-white/80" />
                            <span>Code</span>
                          </span>
                        )}
                        <span className="ml-auto font-semibold text-white group-hover:text-[#9E1B32] transition-colors">
                          {lang === 'id' ? 'Lihat' : 'View'} &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            </ScrollPerspectiveCard>
          )}

          {remainingProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7 lg:gap-9 items-start pt-2">
              <ParallaxColumn
                offsetPx={34}
                className="md:col-span-6 space-y-8"
              >
                {leftColumnProjects.map((project, colIdx) => {
                  const realIndex = filteredProjects.findIndex(
                    (p) => p.id === project.id
                  );
                  return renderGalleryCard(
                    project,
                    realIndex,
                    colIdx % 2 === 1
                  );
                })}
              </ParallaxColumn>

              <ParallaxColumn
                offsetPx={-44}
                className="md:col-span-6 md:pt-14 space-y-8"
              >
                {rightColumnProjects.map((project, colIdx) => {
                  const realIndex = filteredProjects.findIndex(
                    (p) => p.id === project.id
                  );
                  return renderGalleryCard(
                    project,
                    realIndex,
                    colIdx % 2 === 0
                  );
                })}
              </ParallaxColumn>
            </div>
          )}
        </div>
      ) : (
        <div
          onPointerMove={handleListPointerMove}
          onPointerLeave={() => setHoveredProject(null)}
          className="relative"
        >
          <div className="border-t border-white/[0.1]">
            {filteredProjects.map((project, idx) => {
              const numDigits = String(idx + 1).padStart(2, '0');
              const domain = formatDisplayDomain(
                project.project_url,
                project.slug
              );

              return (
                <Reveal
                  key={project.id}
                  variant="fade-up"
                  delay={idx * 75}
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== 'touch') {
                        targetPos.current.x = e.clientX + 26;
                        targetPos.current.y = e.clientY - 115;
                        currentPos.current.x = targetPos.current.x;
                        currentPos.current.y = targetPos.current.y;
                        setHoveredProject(project);
                      }
                    }}
                    className="group py-7 sm:py-8 px-3 sm:px-5 border-b border-white/[0.1] hover:bg-white/[0.025] transition-colors duration-300 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center"
                  >
                    <div className="md:col-span-1 text-[14px] font-mono font-bold text-white/35 group-hover:text-[#9E1B32] transition-colors">
                      {numDigits}
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <h2 className="text-white font-bold text-[22px] sm:text-[26px] leading-[1.15] tracking-[-0.025em] group-hover:text-[#9E1B32] group-hover:translate-x-1.5 transition-all duration-300">
                        {pickLocalized(project.title, lang)}
                      </h2>
                      <p className="text-[12px] text-[#7A7A7A]">{domain}</p>
                    </div>

                    <div className="md:col-span-2">
                      <span className="inline-flex items-center rounded-full bg-[#141414] border border-white/[0.08] px-3 py-1 text-[11.5px] font-semibold text-[#9E1B32]">
                        {pickLocalized(project.category, lang)}
                      </span>
                    </div>

                    <div className="md:col-span-3 flex flex-wrap gap-1.5">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[11.5px] font-mono text-white/60"
                        >
                          {tech}
                          <span className="text-white/25 ml-1.5">/</span>
                        </span>
                      ))}
                    </div>

                    <div className="md:col-span-1 flex md:justify-end">
                      <span className="w-10 h-10 rounded-full bg-[#141414] border border-white/[0.09] group-hover:bg-[#9E1B32] group-hover:border-[#9E1B32] text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-12">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div
            ref={floatingRef}
            aria-hidden="true"
            className={`hidden lg:block fixed top-0 left-0 z-50 w-[350px] pointer-events-none transition-opacity duration-300 ${
              hoveredProject && hoveredProject.thumbnail_url
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            {hoveredProject && hoveredProject.thumbnail_url && (
              <div className="rounded-[20px] overflow-hidden border border-white/15 bg-[#0D0D0D]/95 backdrop-blur-xl shadow-[0_28px_70px_rgba(0,0,0,0.85)] p-2.5 space-y-2">
                <div className="relative aspect-[16/10] w-full rounded-[13px] overflow-hidden bg-[#161616]">
                  <Image
                    src={hoveredProject.thumbnail_url}
                    alt={pickLocalized(hoveredProject.title, lang)}
                    fill
                    className="object-cover object-top"
                    sizes="350px"
                    unoptimized={
                      hoveredProject.thumbnail_url.startsWith('data:') ||
                      hoveredProject.thumbnail_url.endsWith('.svg')
                    }
                  />
                </div>
                <div className="px-1.5 pb-0.5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white truncate">
                    {pickLocalized(hoveredProject.title, lang)}
                  </span>
                  <span className="font-mono text-[#9E1B32] shrink-0 ml-2">
                    {lang === 'id' ? 'Lihat' : 'View'} &rarr;
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
