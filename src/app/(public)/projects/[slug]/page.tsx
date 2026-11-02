import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
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
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PillButton } from '@/components/public/PillButton';
import { FooterBookend } from '@/components/public/FooterBookend';
import { ReadingProgressBar } from '@/components/public/ReadingProgressBar';
import { ImageLightbox } from '@/components/public/ImageLightbox';
import { JsonLd } from '@/components/public/JsonLd';
import { Reveal } from '@/components/motion/Reveal';
import { ParallaxMedia } from '@/components/motion/ParallaxMedia';
import { SpotlightCard } from '@/components/motion/SpotlightCard';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

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

  const chapterHeadings: Array<{ id: string; num: string; title: string }> = [];
  const chapterIdByBlockIndex = new Map<number, string>();
  contentBlocks.forEach((block, blockIndex) => {
    if (block.type === 'h2') {
      const chapterNum = chapterHeadings.length + 1;
      const id = `chapter-${chapterNum}`;
      chapterIdByBlockIndex.set(blockIndex, id);
      chapterHeadings.push({
        id,
        num: String(chapterNum).padStart(2, '0'),
        title: block.text,
      });
    }
  });

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
          1. APPLE-STYLE PRODUCT CINEMA STAGE (CENTERED KEYNOTE + EXPANDING MOCKUP)
      ===================================================================== */}
      <div className="relative overflow-hidden pt-7 px-6 sm:px-12">
        <div
          aria-hidden="true"
          className="cinema-horizon-glow pointer-events-none absolute inset-x-0 top-24 h-[640px]"
        />

        <PublicNavbar
          brandName={brandName}
          ctaUrl={settings?.cta_url || '/#contact'}
          isSubPage
          surfaceVariant="obsidian"
        />

        {/* Keynote Title & Action Row */}
        <header className="relative z-10 w-full max-w-[980px] mx-auto pt-14 sm:pt-20 pb-10 sm:pb-14 text-center space-y-6">
          <Reveal variant="fade-up">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-[#121212] hover:bg-[#1A1A1A] border border-white/[0.1] px-4 py-1.5 text-[12px] font-semibold text-white/85 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#FF5510]" />
                <span>Archive</span>
              </Link>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#121212] border border-white/[0.1] px-4 py-1.5 text-[12px] font-semibold text-white">
                <span className="text-[#FF5510] font-bold">#</span>
                <span>{project.category}</span>
              </span>

              {project.is_featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5510]/15 border border-[#FF5510]/35 px-3.5 py-1.5 text-[11.5px] font-mono font-bold uppercase tracking-wider text-[#FF5510]">
                  Featured Release
                </span>
              )}
            </div>
          </Reveal>

          <Reveal variant="mask-up" delay={140}>
            <h1 className="text-white font-bold text-[36px] sm:text-[56px] lg:text-[68px] leading-[0.98] tracking-[-0.04em]">
              {project.title}
            </h1>
          </Reveal>

          {project.summary && (
            <Reveal variant="fade-up" delay={260}>
              <p className="text-white/75 text-[15.5px] sm:text-[18px] leading-[1.62] max-w-2xl mx-auto font-normal">
                {project.summary}
              </p>
            </Reveal>
          )}

          <Reveal variant="fade-up" delay={360}>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {project.project_url && (
                <PillButton href={project.project_url} variant="orange" external>
                  Visit {displayDomain}
                </PillButton>
              )}

              {project.apk_url && (
                <a
                  href={project.apk_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn inline-flex items-center gap-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] border border-white/15 px-4.5 py-2.5 text-[12.5px] font-semibold text-white transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#FF5510]" />
                  <span>Download APK</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn inline-flex items-center gap-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] border border-white/15 px-4.5 py-2.5 text-[12.5px] font-semibold text-white transition"
                >
                  <Github className="w-3.5 h-3.5 text-white" />
                  <span>Source Code</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
            </div>
          </Reveal>
        </header>

        {/* Widescreen Hero Showcase Frame with Scroll-Scrubbed Cinema Scale Expansion */}
        {project.thumbnail_url && (
          <div className="relative z-10 w-full max-w-[1140px] mx-auto pb-8">
            <Reveal variant="curtain-up" delay={240}>
              <ParallaxMedia
                cinemaExpand
                intensity={0}
                className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#1B1B1B] to-[#0E0E0E] border border-white/[0.1] p-3 sm:p-5 shadow-[0_40px_100px_rgba(0,0,0,0.85)]"
              >
                <div className="rounded-[20px] overflow-hidden border border-white/[0.1] bg-[#0B0B0B] flex flex-col">
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
                    <ParallaxMedia
                      intensity={18}
                      className="aspect-[16/10] w-full bg-[#141414]"
                      innerClassName="relative h-full w-full"
                    >
                      <Image
                        src={project.thumbnail_url}
                        alt={project.title}
                        fill
                        priority
                        className="object-cover object-top"
                        sizes="(max-width: 1140px) 100vw, 1060px"
                        unoptimized={
                          project.thumbnail_url.startsWith('data:') ||
                          project.thumbnail_url.endsWith('.svg')
                        }
                      />
                    </ParallaxMedia>
                  </ImageLightbox>
                </div>
              </ParallaxMedia>
            </Reveal>
          </div>
        )}
      </div>

      {/* =====================================================================
          2. ARCHITECTURAL SPECIFICATION STRIP
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-4 pb-12">
        <Reveal variant="fade-up">
          <div className="rounded-[24px] bg-[#111111] border border-white/[0.08] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
            {project.client_name && (
              <div className="lg:col-span-3 space-y-1">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                  CLIENT / BRAND
                </span>
                <span className="text-white font-semibold text-[15px] block">
                  {project.client_name}
                </span>
              </div>
            )}

            <div className="lg:col-span-3 space-y-1">
              <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                DISCIPLINE
              </span>
              <span className="text-white font-semibold text-[15px] block">
                {project.category}
              </span>
            </div>

            {project.project_url && (
              <div className="lg:col-span-3 space-y-1">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                  PRODUCTION URL
                </span>
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FF5510] hover:text-[#FF6B2B] font-semibold text-[14.5px] transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{displayDomain}</span>
                </a>
              </div>
            )}

            <div
              className={`${
                project.client_name && project.project_url
                  ? 'lg:col-span-3'
                  : 'lg:col-span-6'
              } space-y-2`}
            >
              <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                CORE STACK
              </span>
              {project.tech_stack && project.tech_stack.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-[#181818] border border-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-white/85"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-white/60 text-xs">Full-Stack Production</span>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================================================================
          3. STICKY SPLIT CASE STUDY NARRATIVE (<article>)
      ===================================================================== */}
      <article className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-12 sm:py-16 border-t border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 4 Columns: Sticky Chapter Outline Rail */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <Reveal variant="fade-up">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF5510] block">
                  CASE STUDY BREAKDOWN
                </span>
                <p className="text-white font-bold text-[22px] tracking-[-0.025em]">
                  Architecture &amp; Delivery
                </p>
              </div>
            </Reveal>

            {chapterHeadings.length > 0 && (
              <Reveal variant="fade-up" delay={140}>
                <nav
                  aria-label="Case study chapters"
                  className="border-t border-white/[0.08] pt-4 space-y-2.5"
                >
                  {chapterHeadings.map((ch) => (
                    <a
                      key={ch.id}
                      href={`#${ch.id}`}
                      className="group flex items-baseline gap-3 text-[13px] text-white/60 hover:text-white transition py-1"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#FF5510]">
                        {ch.num}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        {ch.title}
                      </span>
                    </a>
                  ))}
                </nav>
              </Reveal>
            )}
          </aside>

          {/* Right 8 Columns: Structured Markdown Narrative */}
          <div className="lg:col-span-8">
            {contentBlocks.length > 0 ? (
              <div className="space-y-6 text-white/75 leading-[1.8] text-[15px] sm:text-[16px]">
                {contentBlocks.map((block, index) => {
                  if (block.type === 'h2') {
                    const chapterId = chapterIdByBlockIndex.get(index);
                    return (
                      <Reveal key={index} variant="fade-up">
                        <h2
                          id={chapterId}
                          className={`scroll-mt-28 text-white font-bold text-[23px] sm:text-[28px] leading-[1.18] tracking-[-0.025em] ${
                            index > 0 ? 'pt-10 border-t border-white/[0.08]' : ''
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
                        <h3 className="text-white font-bold text-[18px] sm:text-[21px] leading-[1.28] tracking-[-0.02em] pt-4">
                          {block.text}
                        </h3>
                      </Reveal>
                    );
                  }

                  if (block.type === 'ul') {
                    return (
                      <ul key={index} className="space-y-3.5 list-none pl-0 my-5">
                        {block.items.map((it, i) => {
                          const colonIdx = it.indexOf(':');
                          const hasLead = colonIdx > 0 && colonIdx < 70;

                          return (
                            <Reveal
                              key={i}
                              as="li"
                              variant="fade-up"
                              delay={i * 75}
                              className="flex items-start gap-3.5 text-white/80 text-[14.5px] sm:text-[15px] leading-[1.7] rounded-2xl bg-[#111111] border border-white/[0.07] p-4 sm:p-5"
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
                      <p className="text-white/75 leading-[1.82]">{block.text}</p>
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
        </div>
      </article>

      {/* =====================================================================
          4. VISUAL SYSTEM SNAPSHOTS GALLERY (CURTAIN REVEAL + INNER PARALLAX)
      ===================================================================== */}
      {project.gallery_urls && galleryCount > 0 && (
        <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-14 pb-12 border-t border-white/[0.08] space-y-10">
          <Reveal variant="fade-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[#FF5510] font-mono text-[12px] uppercase tracking-[0.2em] mb-2">
                  INTERFACE &amp; SYSTEM SNAPSHOTS
                </p>
                <h2 className="text-white font-bold text-[30px] sm:text-[42px] leading-[1.08] tracking-[-0.03em]">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {project.gallery_urls.map((imgUrl, idx) => {
              const isFullSpan =
                galleryCount % 2 === 1 && idx === galleryCount - 1;
              const numDigits = String(idx + 1).padStart(2, '0');
              const caption = resolveGalleryCaption(project, idx);

              return (
                <Reveal
                  key={idx}
                  variant="curtain-up"
                  delay={(idx % 2) * 140}
                  className={isFullSpan ? 'md:col-span-2' : ''}
                >
                  <SpotlightCard className="group rounded-[28px] bg-[#121212] border border-white/[0.08] hover:border-[#FF5510]/40 p-3.5 sm:p-4 transition-colors shadow-xl flex flex-col gap-4 overflow-hidden">
                    <div className="relative z-10 rounded-[18px] overflow-hidden border border-white/[0.08] bg-[#0B0B0B] flex flex-col">
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
                        <ParallaxMedia
                          intensity={16}
                          className="aspect-[16/10] w-full bg-[#141414]"
                          innerClassName="relative h-full w-full"
                        >
                          <Image
                            src={imgUrl}
                            alt={caption}
                            fill
                            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                            sizes={
                              isFullSpan
                                ? '(max-width: 1140px) 100vw, 1040px'
                                : '(max-width: 768px) 100vw, 510px'
                            }
                            unoptimized={
                              imgUrl.startsWith('data:') || imgUrl.endsWith('.svg')
                            }
                          />
                        </ParallaxMedia>
                      </ImageLightbox>
                    </div>

                    <div className="relative z-10 px-1.5 pb-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[12.5px] font-mono font-bold tracking-tight shrink-0">
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

      {/* =====================================================================
          5. NEXT CASE STUDY & BACK TO ARCHIVE NAVIGATION
      ===================================================================== */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-8 pb-16 space-y-8">
        {nextProject && (
          <Reveal variant="curtain-up" className="pt-8 border-t border-white/[0.08]">
            <SpotlightCard className="rounded-[30px] bg-[#121212] border border-white/[0.08] hover:border-[#FF5510]/45 p-7 sm:p-10 transition-all overflow-hidden">
              <Link
                href={`/projects/${nextProject.slug}`}
                className="relative z-10 group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#FF5510]">
                    UP NEXT // CASE STUDY
                  </span>
                  <h3 className="text-white font-bold text-2xl sm:text-3xl tracking-[-0.025em] group-hover:text-[#FF5510] transition-colors">
                    {nextProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 max-w-xl line-clamp-2">
                    {nextProject.summary}
                  </p>
                </div>

                <span className="inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#181818] border border-white/10 group-hover:bg-[#FF5510] group-hover:border-[#FF5510] text-white transition-all duration-300 group-hover:translate-x-1">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </SpotlightCard>
          </Reveal>
        )}

        <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
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
      </section>

      {/* =====================================================================
          6. FIERY BOOKEND FOOTER WITH CURTAIN UNVEIL
      ===================================================================== */}
      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
