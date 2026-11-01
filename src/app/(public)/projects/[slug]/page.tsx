import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Smartphone,
} from 'lucide-react';
import { getPublicEnv } from '@/lib/env';
import {
  getNextPublishedProject,
  getProjectBySlug,
  getPublishedProjects,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { resolveGalleryCaption } from '@/lib/queries/project-fallbacks';
import { parseCaseStudyMarkdown } from '@/lib/markdown';
import { formatDisplayDomain } from '@/lib/utils';
import { Github } from '@/components/ui/Icons';
import { CompactHero } from '@/components/public/CompactHero';
import { PillButton } from '@/components/public/PillButton';
import { FooterBookend } from '@/components/public/FooterBookend';
import { ReadingProgressBar } from '@/components/public/ReadingProgressBar';
import { ImageLightbox } from '@/components/public/ImageLightbox';
import { JsonLd } from '@/components/public/JsonLd';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renders all published project case studies at build time for instant (<50ms) delivery.
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const projects = await getPublishedProjects();
    return projects.map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found — Argandhi.',
      description: 'Studi kasus portofolio tidak ditemukan.',
    };
  }

  return {
    title: `${project.title} — Argandhi. Case Study`,
    description:
      project.summary ||
      `Studi kasus desain dan pengembangan ${project.title} oleh Faqih Rafasha Argandhi.`,
    openGraph: {
      title: project.title,
      description: project.summary || undefined,
      images: project.thumbnail_url ? [project.thumbnail_url] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const [project, settings, nextProject] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
    getNextPublishedProject(slug),
  ]);

  if (!project) {
    notFound();
  }

  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const brandName = settings?.brand_name || 'Argandhi.';
  const displayDomain = formatDisplayDomain(project.project_url, project.slug);
  const galleryCount = project.gallery_urls?.length || 0;
  const contentBlocks = parseCaseStudyMarkdown(project.content);

  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary || undefined,
    url: `${NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
    author: {
      '@type': 'Person',
      name: 'Faqih Rafasha Argandhi',
    },
    keywords: project.tech_stack?.join(', '),
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      <JsonLd data={caseStudySchema} />
      <ReadingProgressBar />

      {/* =====================================================================
          1. COMPACT FIERY HERO + STACKED #121212 PROJECT METADATA BAR
      ===================================================================== */}
      <CompactHero
        brandName={brandName}
        ctaUrl={settings?.cta_url || '/#contact'}
        backHref="/projects"
        backLabel="Back to Selected Works"
        eyebrow={project.category}
        badges={
          project.is_featured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/95">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5510]" />
              <span>Featured Case Study</span>
            </span>
          ) : undefined
        }
        title={project.title}
        summary={project.summary}
        actions={
          <>
            {project.project_url && (
              <PillButton href={project.project_url} variant="white" external>
                Visit {displayDomain}
              </PillButton>
            )}

            {project.apk_url && (
              <a
                href={project.apk_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn inline-flex items-center gap-2.5 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/20 px-4 py-2 text-[12.5px] font-semibold text-white transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#FF5510]" />
                <span>Download APK</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn inline-flex items-center gap-2.5 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/20 px-4 py-2 text-[12.5px] font-semibold text-white transition"
              >
                <Github className="w-3.5 h-3.5 text-white" />
                <span>Source Code</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
            )}
          </>
        }
        bottomStrip={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-8 text-[12.5px]">
              {project.client_name && (
                <div>
                  <span className="text-[#7A7A7A] text-[11px] font-semibold uppercase tracking-wider block">
                    Client / Brand
                  </span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {project.client_name}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[#7A7A7A] text-[11px] font-semibold uppercase tracking-wider block">
                  Discipline
                </span>
                <span className="text-white font-semibold mt-0.5 block">
                  {project.category}
                </span>
              </div>

              {project.project_url && (
                <div>
                  <span className="text-[#7A7A7A] text-[11px] font-semibold uppercase tracking-wider block">
                    Live URL
                  </span>
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#FF5510] hover:text-[#FF6B2B] font-semibold mt-0.5 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{displayDomain}</span>
                  </a>
                </div>
              )}
            </div>

            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-[#181818] border border-white/[0.08] px-3 py-1 text-[11.5px] font-semibold text-white/85"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* =====================================================================
          2. CASE STUDY SHOWCASE & EDITORIAL NARRATIVE (ON #080808)
      ===================================================================== */}
      <article className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-16 sm:pt-20 pb-12 space-y-16">
        {/* Main Hero Screenshot Frame with Lightbox Inspection */}
        {project.thumbnail_url && (
          <Reveal variant="scale">
            <div className="rounded-[28px] sm:rounded-[34px] bg-gradient-to-b from-[#171717] to-[#101010] border border-white/[0.08] p-3 sm:p-5 shadow-2xl">
              <div className="rounded-[20px] overflow-hidden border border-white/[0.09] bg-[#0B0B0B] flex flex-col">
                <div className="h-9 shrink-0 bg-[#111111] border-b border-white/[0.07] px-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/85" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/85" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/85" />
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.06] px-3.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-white/70 truncate">
                      https://{displayDomain}
                    </span>
                  </div>

                  <div className="w-10" />
                </div>

                <ImageLightbox
                  src={project.thumbnail_url}
                  alt={project.title}
                  caption={`${project.title} — Primary Production Interface`}
                >
                  <div className="relative aspect-[16/10] w-full bg-[#141414]">
                    <Image
                      src={project.thumbnail_url}
                      alt={project.title}
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 1140px) 100vw, 1040px"
                      unoptimized={
                        project.thumbnail_url.startsWith('data:') ||
                        project.thumbnail_url.endsWith('.svg')
                      }
                    />
                  </div>
                </ImageLightbox>
              </div>
            </div>
          </Reveal>
        )}

        {/* Markdown Case Study Narrative */}
        <div className="max-w-3xl mx-auto">
          {contentBlocks.length > 0 ? (
            <div className="space-y-6 text-white/75 leading-[1.78] text-[14.5px] sm:text-[15.5px]">
              {contentBlocks.map((block, index) => {
                if (block.type === 'h2') {
                  return (
                    <Reveal key={index} variant="fade-up">
                      <h2
                        className={`text-white font-bold text-[22px] sm:text-[26px] leading-[1.2] tracking-[-0.025em] ${
                          index > 0 ? 'pt-8 border-t border-white/[0.07]' : ''
                        }`}
                      >
                        {block.text}
                      </h2>
                    </Reveal>
                  );
                }

                if (block.type === 'h3') {
                  return (
                    <Reveal key={index} variant="fade-up">
                      <h3 className="text-white font-bold text-[17px] sm:text-[20px] leading-[1.28] tracking-[-0.02em] pt-4">
                        {block.text}
                      </h3>
                    </Reveal>
                  );
                }

                if (block.type === 'ul') {
                  return (
                    <ul key={index} className="space-y-3 list-none pl-0 my-4">
                      {block.items.map((it, i) => {
                        const colonIdx = it.indexOf(':');
                        const hasLead = colonIdx > 0 && colonIdx < 70;

                        return (
                          <Reveal
                            key={i}
                            as="li"
                            variant="fade-up"
                            delay={i * 40}
                            className="flex items-start gap-3 text-white/80 text-[14px] sm:text-[14.5px] leading-[1.68] rounded-2xl bg-[#121212] border border-white/[0.06] p-4"
                          >
                            <CheckCircle2 className="h-4 w-4 text-[#FF5510] shrink-0 mt-1" />
                            <span>
                              {hasLead ? (
                                <>
                                  <strong className="text-white font-semibold">
                                    {it.slice(0, colonIdx + 1)}
                                  </strong>
                                  {it.slice(colonIdx + 1)}
                                </>
                              ) : (
                                it
                              )}
                            </span>
                          </Reveal>
                        );
                      })}
                    </ul>
                  );
                }

                return (
                  <Reveal key={index} variant="fade-up">
                    <p className="text-white/75 leading-[1.78]">{block.text}</p>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] bg-[#121212] border border-white/[0.07] p-8 text-center text-[#7A7A7A] text-[14px]">
              Detailed engineering case study narrative is currently being documented.
            </div>
          )}
        </div>

        {/* Visual Gallery Showcase (16:10 Browser Frames + Lightbox Zoom) */}
        {project.gallery_urls && galleryCount > 0 && (
          <section className="space-y-8 pt-10 border-t border-white/[0.07]">
            <Reveal variant="fade-up">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-[#FF5510] font-semibold text-[15px] mb-1.5">
                    # Interface &amp; System Snapshots
                  </p>
                  <h2 className="text-white font-bold text-[28px] sm:text-[38px] leading-[1.1] tracking-[-0.03em]">
                    Inside the Live Experience
                  </h2>
                </div>

                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/75 hover:text-[#FF5510] transition"
                  >
                    <span>Explore live at {displayDomain}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF5510]" />
                  </a>
                )}
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.gallery_urls.map((imgUrl, idx) => {
                const isFullSpan =
                  galleryCount % 2 === 1 && idx === galleryCount - 1;
                const numDigits = String(idx + 1).padStart(2, '0');
                const caption = resolveGalleryCaption(project, idx);

                return (
                  <Reveal
                    key={idx}
                    variant="fade-up"
                    delay={idx * 75}
                    className={isFullSpan ? 'md:col-span-2' : ''}
                  >
                    <SpotlightCard className="group rounded-[26px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-3 sm:p-4 transition-colors shadow-xl flex flex-col gap-3.5 overflow-hidden">
                      <div className="relative z-10 rounded-[16px] overflow-hidden border border-white/[0.08] bg-[#0B0B0B] flex flex-col">
                        <div className="h-7 shrink-0 bg-[#111111] border-b border-white/[0.06] px-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-white/25" />
                            <span className="h-2 w-2 rounded-full bg-white/15" />
                            <span className="h-2 w-2 rounded-full bg-white/10" />
                          </div>
                          <span className="text-[10px] font-mono text-white/45 truncate">
                            {displayDomain}
                          </span>
                          <div className="w-6" />
                        </div>

                        <ImageLightbox src={imgUrl} alt={caption} caption={caption}>
                          <div className="relative aspect-[16/10] w-full bg-[#141414] overflow-hidden">
                            <Image
                              src={imgUrl}
                              alt={caption}
                              fill
                              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                              sizes={
                                isFullSpan
                                  ? '(max-width: 1140px) 100vw, 1040px'
                                  : '(max-width: 768px) 100vw, 510px'
                              }
                              unoptimized={
                                imgUrl.startsWith('data:') || imgUrl.endsWith('.svg')
                              }
                            />
                          </div>
                        </ImageLightbox>
                      </div>

                      <div className="relative z-10 px-1.5 pb-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[12.5px] font-bold tracking-tight shrink-0">
                            <span className="text-[#FF5510]">#</span>
                            <span className="text-white">{numDigits}</span>
                          </span>
                          <p className="text-white/85 text-[13px] font-medium truncate">
                            {caption}
                          </p>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* Next Case Study Card (Seamless Portfolio Flow) */}
        {nextProject && (
          <Reveal variant="fade-up" className="pt-8 border-t border-white/[0.07]">
            <SpotlightCard className="rounded-[28px] bg-[#121212] border border-white/[0.08] hover:border-[#FF5510]/45 p-6 sm:p-8 transition-all overflow-hidden">
              <Link
                href={`/projects/${nextProject.slug}`}
                className="relative z-10 group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5510]">
                    # Next Case Study
                  </span>
                  <h3 className="text-white font-bold text-xl sm:text-2xl tracking-[-0.02em] group-hover:text-[#FF5510] transition-colors">
                    {nextProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 max-w-xl line-clamp-2">
                    {nextProject.summary}
                  </p>
                </div>

                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#181818] border border-white/10 group-hover:bg-[#FF5510] group-hover:border-[#FF5510] text-white transition-all duration-300 group-hover:translate-x-1">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </SpotlightCard>
          </Reveal>
        )}

        {/* Back to Portfolio Navigation Row */}
        <div className="pt-8 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/projects"
            className="text-[13.5px] font-semibold text-white/75 hover:text-white transition"
          >
            &larr; Explore All Archive Projects
          </Link>

          <PillButton href="/#contact" variant="orange">
            Build a similar project
          </PillButton>
        </div>
      </article>

      {/* =====================================================================
          3. FIERY BOOKEND FOOTER
      ===================================================================== */}
      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
