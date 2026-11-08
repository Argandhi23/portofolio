import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Globe,
  Smartphone,
} from 'lucide-react';
import { getPublicEnv } from '@/lib/env';
import { pickLocalized } from '@/lib/i18n/localized';
import {
  getNextPublishedProject,
  getProjectBySlug,
  getPublishedProjects,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { resolveGalleryCaption } from '@/lib/queries/project-fallbacks';
import { formatDisplayDomain, isMobileProject } from '@/lib/utils';
import { PhoneFrame } from '@/components/public/PhoneFrame';
import { Github } from '@/components/ui/Icons';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PillButton } from '@/components/public/PillButton';
import { FooterBookend } from '@/components/public/FooterBookend';
import { ReadingProgressBar } from '@/components/public/ReadingProgressBar';
import { ImageLightbox } from '@/components/public/ImageLightbox';
import { JsonLd } from '@/components/public/JsonLd';
import {
  CmsText,
  LocalizedCaseStudyArticle,
  T,
} from '@/components/public/LanguageProvider';
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
    };
  }

  const cleanTitle = pickLocalized(project.title, 'en');
  const cleanSummary = pickLocalized(project.summary, 'en');

  return {
    title: `${cleanTitle} — Argandhi.`,
    description: cleanSummary || `${cleanTitle} by Faqih Rafasha Argandhi.`,
    openGraph: {
      title: cleanTitle,
      description: cleanSummary || undefined,
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
  const cleanTitleEn = pickLocalized(project.title, 'en');
  const cleanSummaryEn = pickLocalized(project.summary, 'en');
  const isMobile = isMobileProject(project);

  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: cleanTitleEn,
    description: cleanSummaryEn || undefined,
    url: `${NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
    author: {
      '@type': 'Person',
      name: 'Faqih Rafasha Argandhi',
    },
    keywords: project.tech_stack?.join(', '),
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#9E1B32] selection:text-white">
      <JsonLd data={caseStudySchema} />
      <ReadingProgressBar />

      {/* 1. HERO STAGE */}
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

        <header className="relative z-10 w-full max-w-[980px] mx-auto pt-14 sm:pt-20 pb-10 sm:pb-14 text-center space-y-5">
          <Reveal variant="fade-up">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-[#121212] hover:bg-[#1A1A1A] border border-white/[0.1] px-4 py-1.5 text-[12px] font-semibold text-white/85 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#9E1B32]" />
                <span>
                  <T en="Projects" id="Proyek" />
                </span>
              </Link>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#121212] border border-white/[0.1] px-4 py-1.5 text-[12px] font-semibold text-white">
                <span className="text-[#9E1B32] font-bold">#</span>
                <span>
                  <CmsText value={project.category} />
                </span>
              </span>
            </div>
          </Reveal>

          <Reveal variant="mask-up" delay={140}>
            <h1 className="text-white font-bold text-[36px] sm:text-[56px] lg:text-[68px] leading-[0.98] tracking-[-0.04em]">
              <CmsText value={project.title} />
            </h1>
          </Reveal>

          {project.summary && (
            <Reveal variant="fade-up" delay={260}>
              <p className="text-white/75 text-[15.5px] sm:text-[17.5px] leading-[1.6] max-w-2xl mx-auto font-normal">
                <CmsText value={project.summary} />
              </p>
            </Reveal>
          )}

          <Reveal variant="fade-up" delay={360}>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {project.project_url && (
                <PillButton href={project.project_url} variant="orange" external>
                  {displayDomain}
                </PillButton>
              )}

              {project.apk_url && (
                <a
                  href={project.apk_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn inline-flex items-center gap-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] border border-white/15 px-4.5 py-2.5 text-[12.5px] font-semibold text-white transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#9E1B32]" />
                  <span>
                    <T en="Download APK" id="Unduh APK" />
                  </span>
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
                  <span>
                    <T en="Source Code" id="Kode Sumber" />
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
            </div>
          </Reveal>
        </header>

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
                    {isMobile ? (
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-[#9E1B32]" />
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9E1B32]">
                          Mobile APK • Flutter
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                      </div>
                    )}

                    <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.06] px-3.5 py-0.5">
                      {isMobile ? (
                        <>
                          <Smartphone className="w-3 h-3 text-[#9E1B32]" />
                          <span className="text-[11px] font-mono text-white/70 truncate">
                            {project.slug}.apk
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[11px] font-mono text-white/70 truncate">
                            https://{displayDomain}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="w-10" />
                  </div>

                  <ImageLightbox
                    src={project.thumbnail_url}
                    alt={cleanTitleEn}
                    caption={cleanTitleEn}
                  >
                    <ParallaxMedia
                      intensity={0}
                      className="aspect-[16/10] w-full bg-[#141414]"
                      innerClassName="relative h-full w-full"
                    >
                      <Image
                        src={project.thumbnail_url}
                        alt={cleanTitleEn}
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

      {/* 2. SPECIFICATION STRIP */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-4 pb-12">
        <Reveal variant="fade-up">
          <div className="rounded-[24px] bg-[#111111] border border-white/[0.08] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
            {project.client_name && (
              <div className="lg:col-span-3 space-y-1">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                  <T en="Client" id="Klien" />
                </span>
                <span className="text-white font-semibold text-[15px] block">
                  {project.client_name}
                </span>
              </div>
            )}

            <div className="lg:col-span-3 space-y-1">
              <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                <T en="Category" id="Kategori" />
              </span>
              <span className="text-white font-semibold text-[15px] block">
                <CmsText value={project.category} />
              </span>
            </div>

            {project.project_url && (
              <div className="lg:col-span-3 space-y-1">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#7A7A7A] block">
                  <T en="Live" id="Situs" />
                </span>
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#9E1B32] hover:text-[#B8233E] font-semibold text-[14.5px] transition"
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
                Stack
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
                <span className="text-white/60 text-xs">Full-Stack</span>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. CASE STUDY BREAKDOWN (Bilingual EN / ID) */}
      <LocalizedCaseStudyArticle rawContent={project.content} />

      {/* 4. SCREENSHOTS GALLERY */}
      {project.gallery_urls && galleryCount > 0 && (
        <section
          id="gallery"
          className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-14 pb-12 border-t border-white/[0.08] space-y-8"
        >
          <Reveal variant="fade-up">
            <h2 className="text-white font-bold text-[28px] sm:text-[38px] leading-[1.08] tracking-[-0.03em]">
              <T en="Screenshots" id="Tampilan Sistem" />
            </h2>
          </Reveal>

          {isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-start">
              {project.gallery_urls.map((imgUrl, idx) => {
                const numDigits = String(idx + 1).padStart(2, '0');
                const captionEn = resolveGalleryCaption(project, idx, 'en');
                const captionId = resolveGalleryCaption(project, idx, 'id');

                return (
                  <Reveal
                    key={idx}
                    variant="curtain-up"
                    delay={(idx % 4) * 100}
                  >
                    <SpotlightCard className="group rounded-[32px] bg-[#121212] border border-white/[0.08] hover:border-[#9E1B32]/45 p-4 sm:p-5 transition-all duration-300 shadow-2xl flex flex-col gap-4 overflow-hidden">
                      <div className="py-2 flex items-center justify-center">
                        <PhoneFrame
                          src={imgUrl}
                          alt={captionEn}
                          caption={captionEn}
                          size="md"
                        />
                      </div>

                      <div className="relative z-10 px-1 pt-2 pb-0.5 flex items-center gap-2.5 min-w-0 border-t border-white/[0.06]">
                        <span className="text-[12px] font-mono font-bold tracking-tight shrink-0">
                          <span className="text-[#9E1B32]">#</span>
                          <span className="text-white">{numDigits}</span>
                        </span>
                        <p className="text-white/85 text-[12.5px] font-medium truncate">
                          <T en={captionEn} id={captionId} />
                        </p>
                      </div>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {project.gallery_urls.map((imgUrl, idx) => {
                const isFullSpan =
                  galleryCount % 2 === 1 && idx === galleryCount - 1;
                const numDigits = String(idx + 1).padStart(2, '0');
                const captionEn = resolveGalleryCaption(project, idx, 'en');
                const captionId = resolveGalleryCaption(project, idx, 'id');

                return (
                  <Reveal
                    key={idx}
                    variant="curtain-up"
                    delay={(idx % 2) * 140}
                    className={isFullSpan ? 'md:col-span-2' : ''}
                  >
                    <SpotlightCard className="group rounded-[28px] bg-[#121212] border border-white/[0.08] hover:border-[#9E1B32]/40 p-3.5 sm:p-4 transition-colors shadow-xl flex flex-col gap-3.5 overflow-hidden">
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

                        <ImageLightbox
                          src={imgUrl}
                          alt={captionEn}
                          caption={captionEn}
                        >
                          <ParallaxMedia
                            intensity={0}
                            className="aspect-[16/10] w-full bg-[#141414]"
                            innerClassName="relative h-full w-full"
                          >
                            <Image
                              src={imgUrl}
                              alt={captionEn}
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

                      <div className="relative z-10 px-1.5 pb-0.5 flex items-center gap-2.5 min-w-0">
                        <span className="text-[12.5px] font-mono font-bold tracking-tight shrink-0">
                          <span className="text-[#9E1B32]">#</span>
                          <span className="text-white">{numDigits}</span>
                        </span>
                        <p className="text-white/85 text-[13px] font-medium truncate">
                          <T en={captionEn} id={captionId} />
                        </p>
                      </div>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 5. NEXT PROJECT & NAVIGATION */}
      <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-8 pb-16 space-y-8">
        {nextProject && (
          <Reveal variant="curtain-up" className="pt-8 border-t border-white/[0.08]">
            <SpotlightCard className="rounded-[30px] bg-[#121212] border border-white/[0.08] hover:border-[#9E1B32]/45 p-7 sm:p-9 transition-all overflow-hidden">
              <Link
                href={`/projects/${nextProject.slug}`}
                className="relative z-10 group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#9E1B32]">
                    <T en="Next Project" id="Proyek Berikutnya" />
                  </span>
                  <h3 className="text-white font-bold text-2xl sm:text-3xl tracking-[-0.025em] group-hover:text-[#9E1B32] transition-colors">
                    <CmsText value={nextProject.title} />
                  </h3>
                  {nextProject.summary && (
                    <p className="text-xs sm:text-sm text-white/60 max-w-xl line-clamp-2">
                      <CmsText value={nextProject.summary} />
                    </p>
                  )}
                </div>

                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#181818] border border-white/10 group-hover:bg-[#9E1B32] group-hover:border-[#9E1B32] text-white transition-all duration-300 group-hover:translate-x-1">
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
            &larr; <T en="All Projects" id="Semua Proyek" />
          </Link>

          <PillButton href="/#contact" variant="orange">
            <T en="Start a project" id="Mulai proyek" />
          </PillButton>
        </div>
      </section>

      {/* 6. FOOTER BOOKEND */}
      <FooterBookend settings={settings} showContactGrid={false} />
    </main>
  );
}
