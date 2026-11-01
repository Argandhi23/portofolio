import { GraduationCap } from 'lucide-react';
import { getPublicEnv } from '@/lib/env';
import {
  getSiteSettings,
  getServices,
  getBrands,
  getPublishedProjects,
} from '@/lib/queries/portfolio.queries';
import { HeroSection } from '@/components/public/HeroSection';
import { SectionHeader } from '@/components/public/SectionHeader';
import { EditorialIdentityCards } from '@/components/public/EditorialIdentityCards';
import { SelectedWorksSection } from '@/components/public/SelectedWorksSection';
import { ServicesProcessSection } from '@/components/public/ServicesProcessSection';
import { FooterBookend } from '@/components/public/FooterBookend';
import { JsonLd } from '@/components/public/JsonLd';
import { Reveal } from '@/components/motion/Reveal';

export default async function HomePage() {
  const [settings, services, brands, publishedProjects] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getBrands(),
    getPublishedProjects(),
  ]);

  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const aboutLabel = settings.about_label || 'Behind the Code';
  const aboutHeading =
    settings.about_heading ||
    'Engineering Digital Products That Make Life Simpler';
  const aboutDescription =
    settings.about_description ||
    "I'm Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. I focus on building clean, scalable web platforms, mobile APKs, and AI-integrated systems that solve real-world problems.";
  const ctaUrl = settings.cta_url || '#contact';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Faqih Rafasha Argandhi',
    alternateName: settings.brand_name || 'Argandhi.',
    url: NEXT_PUBLIC_SITE_URL,
    jobTitle: settings.hero_title || 'Full-Stack & Software Developer',
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Universitas Negeri Surabaya (UNESA)',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Surabaya',
      addressCountry: 'ID',
    },
    sameAs: settings.github_url ? [settings.github_url] : [],
    knowsAbout: [
      'Next.js',
      'TypeScript',
      'Supabase',
      'PostgreSQL',
      'Flutter',
      'AI Systems Engineering',
    ],
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#FF5510] selection:text-white">
      <JsonLd data={personSchema} />

      {/* =====================================================================
          1. TOP LAYER: FIERY HERO CARD + TECH STACK STRIP (#121212 rounded-b-[42px])
      ===================================================================== */}
      <HeroSection
        settings={settings}
        services={services}
        brands={brands}
      />

      {/* =====================================================================
          2. BEHIND THE CODE (ABOUT) + 3 MONOCHROME EDITORIAL IDENTITY CARDS
             Pure Black Background (#080808)
      ===================================================================== */}
      <section
        id="about"
        className="bg-[#080808] w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-20 sm:pt-24 pb-10 space-y-14"
      >
        <SectionHeader
          eyebrow={aboutLabel}
          heading={aboutHeading}
          lead={aboutDescription}
          microLabel={
            <>
              Academic Background &amp;
              <br />
              Engineering Philosophy
            </>
          }
          ctaHref="/about"
          ctaLabel="Read full profile"
          badge={
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[#121212] border border-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/85">
              <GraduationCap className="w-4 h-4 text-[#FF5510] shrink-0" />
              <span>
                S1 Teknik Informatika — Universitas Negeri Surabaya (&apos;24)
              </span>
            </div>
          }
        />

        {/* 3-Column Monochrome Editorial Showcase Cards (Web, Mobile APK, AI Systems) */}
        <Reveal variant="scale" delay={80}>
          <EditorialIdentityCards />
        </Reveal>
      </section>

      {/* =====================================================================
          3. SELECTED WORKS — DYNAMIC PROJECTS FROM SUPABASE CMS
      ===================================================================== */}
      <SelectedWorksSection
        projects={publishedProjects}
        ctaUrl={ctaUrl}
      />

      {/* =====================================================================
          4. CAPABILITIES & SERVICES (#121212 Rounded-[42px] Surface)
      ===================================================================== */}
      <ServicesProcessSection
        services={services}
        ctaUrl={ctaUrl}
      />

      {/* =====================================================================
          5. CONTACT INQUIRY & FIERY SUNSET GLOW BOOKEND FOOTER
      ===================================================================== */}
      <FooterBookend settings={settings} showContactGrid />
    </main>
  );
}
