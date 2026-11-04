import { getPublicEnv } from '@/lib/env';
import { pickLocalized } from '@/lib/i18n/localized';
import { PUBLIC_COPY } from '@/lib/i18n/dictionary';
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
import {
  CmsText,
  LocalizedScrollTextReveal,
  T,
} from '@/components/public/LanguageProvider';
import { HeroEyePortal } from '@/components/motion/HeroEyePortal';
import { ScrollSectionOverlap } from '@/components/motion/ScrollSectionOverlap';

export default async function HomePage() {
  const [settings, services, brands, publishedProjects] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getBrands(),
    getPublishedProjects(),
  ]);

  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const ctaUrl = settings.cta_url || '#contact';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Faqih Rafasha Argandhi',
    alternateName: settings.brand_name || 'Argandhi.',
    url: NEXT_PUBLIC_SITE_URL,
    jobTitle:
      pickLocalized(settings.hero_title, 'en') || 'Software Developer',
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'Universitas Negeri Surabaya (UNESA)',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Asah led by Dicoding (Supported by GoTo) — Next-Gen AI Engineer',
      },
      {
        '@type': 'HighSchool',
        name: 'MAN 2 Kota Madiun',
      },
    ],
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
      'Generative AI',
    ],
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#9E1B32] selection:text-white">
      <JsonLd data={personSchema} />

      {/* 1 & 2. HERO STAGE -> EYE PORTAL CAMERA ZOOM -> ABOUT & EDUCATION (#F5F0EB) */}
      <HeroEyePortal
        contentId="about"
        hero={
          <HeroSection
            settings={settings}
            services={services}
            brands={brands}
          />
        }
      >
        <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-24 sm:pt-32 pb-28 sm:pb-36 space-y-14">
          <SectionHeader
            eyebrow={
              <CmsText
                value={settings.about_label}
                fallbackEn="About"
                fallbackId="Tentang"
              />
            }
            heading={
              <CmsText
                value={settings.about_heading}
                fallbackEn="Building Practical Digital Products"
                fallbackId="Membangun Produk Digital Fungsional"
              />
            }
            lead={
              <CmsText
                value={settings.about_description}
                fallbackEn="Full-Stack Developer in Surabaya turning ideas into fast, reliable web and mobile apps."
                fallbackId="Full-Stack Developer di Surabaya yang mengubah ide menjadi aplikasi web & mobile cepat."
              />
            }
            ctaHref="/about"
            ctaLabel={<T en="Full profile" id="Profil lengkap" />}
          />

          <div
            style={{
              borderColor: 'var(--sec-divider, rgba(13, 13, 13, 0.12))',
            }}
            className="py-6 sm:py-9 border-y"
          >
            <LocalizedScrollTextReveal
              enText={PUBLIC_COPY.home.manifesto.en}
              idText={PUBLIC_COPY.home.manifesto.id}
              enHighlights={PUBLIC_COPY.home.manifesto.enHighlights}
              idHighlights={PUBLIC_COPY.home.manifesto.idHighlights}
              className="text-[26px] sm:text-[38px] lg:text-[44px]"
            />
          </div>

          <EditorialIdentityCards />
        </div>
      </HeroEyePortal>

      {/* 3. FEATURED PROJECTS (Matte Black Slab Covering Warm Cream + Sticky Card Stack) */}
      <ScrollSectionOverlap
        id="projects"
        zIndex={30}
        overlapPrevious
        recedeOnExit={false}
        className="bg-[#080808] pb-14"
      >
        <SelectedWorksSection
          projects={publishedProjects}
          ctaUrl={ctaUrl}
        />
      </ScrollSectionOverlap>

      {/* 4. SERVICES (Covers Projects + Cards Morph to Burgundy on Scroll) */}
      <ScrollSectionOverlap
        id="services"
        zIndex={40}
        overlapPrevious
        recedeOnExit
        className="bg-[#0E0E0E] pb-14"
      >
        <ServicesProcessSection
          services={services}
          ctaUrl={ctaUrl}
        />
      </ScrollSectionOverlap>

      {/* 5. CONTACT & BOOKEND FOOTER (Covers Services) */}
      <ScrollSectionOverlap
        zIndex={50}
        overlapPrevious
        recedeOnExit={false}
        className="bg-[#080808]"
      >
        <FooterBookend settings={settings} showContactGrid />
      </ScrollSectionOverlap>
    </main>
  );
}
