'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Globe, Search, Smartphone } from 'lucide-react';
import type { Project } from '@/types/database.types';
import { formatDisplayDomain } from '@/lib/utils';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { Github } from '@/components/ui/Icons';

interface ProjectsArchiveGridProps {
  projects: Project[];
}

export function ProjectsArchiveGrid({ projects }: ProjectsArchiveGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState<string>('');

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(projects.map((p) => p.category.trim()).filter(Boolean))
    );
    return ['All', ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchCat =
        selectedCategory === 'All' ||
        project.category.trim().toLowerCase() ===
          selectedCategory.toLowerCase();
      if (!matchCat) return false;
      if (!q) return true;

      return (
        project.title.toLowerCase().includes(q) ||
        project.category.toLowerCase().includes(q) ||
        (project.summary?.toLowerCase().includes(q) ?? false) ||
        project.tech_stack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, selectedCategory, query]);

  return (
    <div className="space-y-10">
      {/* Interactive Filter Pills + Instant Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
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
                    ? 'bg-[#FF5510] text-white shadow-lg shadow-[#FF5510]/25'
                    : 'bg-[#121212] text-white/70 border border-white/[0.08] hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
          <input
            type="search"
            aria-label="Search projects by title or tech stack"
            placeholder="Search stack or project..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full bg-[#121212] border border-white/[0.08] pl-10 pr-4 py-2 text-[12.5px] text-white placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#FF5510] transition"
          />
        </div>
      </div>

      {/* Filtered Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-[28px] bg-[#121212] border border-white/[0.07] p-14 text-center space-y-3">
          <p className="text-white font-bold text-base">
            Tidak ada proyek yang cocok dengan filter
          </p>
          <p className="text-[#7A7A7A] text-xs max-w-md mx-auto">
            Coba pilih kategori lain atau hapus kata kunci pencarian.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setQuery('');
            }}
            className="mt-2 inline-flex items-center rounded-full bg-[#FF5510] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, idx) => {
            const numDigits = String(idx + 1).padStart(2, '0');
            const domain = formatDisplayDomain(
              project.project_url,
              project.slug
            );

            return (
              <SpotlightCard
                key={project.id}
                className="rounded-[28px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/45 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl"
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="relative z-10 group flex flex-col h-full"
                >
                  {/* Browser Preview Frame */}
                  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-3.5 sm:p-4 border-b border-white/[0.06]">
                    <div className="w-full rounded-[18px] overflow-hidden border border-white/[0.1] bg-[#0B0B0B] flex flex-col">
                      <div className="h-8 shrink-0 bg-[#111111] border-b border-white/[0.07] px-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/85" />
                          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/85" />
                          <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/85" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-0.5 max-w-[200px]">
                          {project.project_url && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          )}
                          <span className="text-[10.5px] font-mono text-white/65 truncate">
                            {domain}
                          </span>
                        </div>

                        <div className="w-8" />
                      </div>

                      <div className="relative aspect-[16/10] w-full bg-[#141414] overflow-hidden">
                        {project.thumbnail_url ? (
                          <Image
                            src={project.thumbnail_url}
                            alt={project.title}
                            fill
                            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            sizes="(max-width: 768px) 100vw, 520px"
                            unoptimized={
                              project.thumbnail_url.startsWith('data:') ||
                              project.thumbnail_url.endsWith('.svg')
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#7A7A7A] text-xs">
                            Project Preview
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
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
                            {project.category}
                          </span>
                        </div>

                        <span className="w-8 h-8 rounded-full bg-[#181818] border border-white/[0.08] group-hover:bg-[#FF5510] group-hover:border-[#FF5510] text-white flex items-center justify-center transition-colors duration-300">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <h2 className="text-white font-bold text-[21px] sm:text-[23px] leading-[1.2] tracking-[-0.02em] group-hover:text-[#FF5510] transition-colors">
                        {project.title}
                      </h2>

                      {project.summary && (
                        <p className="text-white/70 text-[13px] leading-[1.58] line-clamp-3">
                          {project.summary}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.tech_stack.slice(0, 5).map((tech) => (
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
                          Case Study &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
