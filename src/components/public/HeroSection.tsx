import Image from 'next/image';
import type { SiteSettings, Service, Brand } from '@/types/database.types';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { HeroSilhouette } from '@/components/public/HeroSilhouette';
import { HeroAmbientGlow } from '@/components/motion/HeroAmbientGlow';
import { Reveal } from '@/components/motion/Reveal';
import { TechLogo } from '@/components/ui/TechLogos';

interface HeroSectionProps {
  settings: SiteSettings;
  services: Service[];
  brands: Brand[];
}

function splitServiceNumber(label: string): { hash: string; digits: string } {
  const trimmed = label.trim();
  if (trimmed.startsWith('#')) {
    return { hash: '#', digits: trimmed.slice(1) };
  }
  return { hash: '#', digits: trimmed };
}

export function HeroSection({ settings, services, brands }: HeroSectionProps) {
  const brandName = settings.brand_name || 'Argandhi.';
  const heroGreeting =
    settings.hero_greeting || "Hey, I'm Faqih Rafasha —";
  const heroTitle = settings.hero_title || 'Software Developer';
  const heroSubtitle =
    settings.hero_subtitle || 'Great software should feel effortless.';
  const heroDescription =
    settings.hero_description ||
    "Informatics Engineering student at UNESA ('24) & Freelance Full-Stack Developer crafting fast, scalable web apps, mobile APKs, and AI-powered software.";
  const ctaUrl = settings.cta_url || '#contact';

  const heroTitleWords = heroTitle.trim().split(/\s+/);
  const useMarquee = brands.length > 5;
  const displayBrands = useMarquee ? [...brands, ...brands] : brands;

  return (
    <div
      id="home"
      className="bg-[#121212] rounded-b-[42px] border-b border-white/[0.06] relative z-10 pb-8"
    >
      {/* ==========================================
          HERO CARD (Fiery Radial Gradient + Rounded Bottom 42px)
      =========================================== */}
      <section className="hero-card px-6 sm:px-12 pt-7 pb-11 min-h-[610px] sm:min-h-[660px] flex flex-col justify-between">
        {/* Interactive Damped Studio Glow + Bottom Vignette */}
        <HeroAmbientGlow />
        <div className="hero-glow-bottom" aria-hidden="true" />

        {/* Center Studio Silhouette / CMS Hero Portrait */}
        <HeroSilhouette
          heroImageUrl={settings.hero_image_url}
          altText={`${brandName} — Faqih Rafasha Argandhi`}
        />

        {/* 1. TOP NAVBAR */}
        <PublicNavbar brandName={brandName} ctaUrl={ctaUrl} />

        {/* 2. HERO CENTER CONTENT (Choreographed Staggered Reveal) */}
        <div className="relative z-10 w-full max-w-[1140px] mx-auto my-auto pt-14 pb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          {/* Left Main Display Heading */}
          <div className="md:col-span-7">
            <Reveal variant="fade-up" delay={0}>
              <p className="text-white/95 text-[20px] sm:text-[23px] font-semibold tracking-[-0.02em] mb-2">
                {heroGreeting}
              </p>
            </Reveal>

            <Reveal variant="mask-up" delay={120}>
              <h1 className="text-white font-bold text-[54px] sm:text-[76px] lg:text-[84px] leading-[0.93] tracking-[-0.04em]">
                {heroTitleWords.length >= 2 ? (
                  <>
                    {heroTitleWords[0]}
                    <br />
                    {heroTitleWords.slice(1).join(' ')}
                  </>
                ) : (
                  heroTitle
                )}
              </h1>
            </Reveal>
          </div>

          {/* Right Supporting Statement */}
          <Reveal
            variant="fade-up"
            delay={360}
            className="md:col-span-5 md:pl-8 pb-1"
          >
            <h2 className="text-white font-bold text-[20px] sm:text-[24px] leading-[1.22] tracking-[-0.02em] mb-3 max-w-[300px]">
              {heroSubtitle}
            </h2>
            <p className="text-white/75 text-[12.5px] sm:text-[13.5px] leading-[1.55] max-w-[310px] font-normal">
              {heroDescription}
            </p>
          </Reveal>
        </div>

        {/* 3. HERO BOTTOM 4-COLUMN SERVICES ROW (#01 - #04) */}
        <div className="relative z-10 w-full max-w-[1140px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
          {services.map((svc, idx) => {
            const { hash, digits } = splitServiceNumber(svc.number_label);
            return (
              <Reveal key={svc.id} variant="fade-up" delay={460 + idx * 110}>
                <div className="group/svc">
                  <div className="text-[12.5px] sm:text-[13px] font-bold tracking-tight mb-1">
                    <span className="text-[#FF5510]">{hash}</span>
                    <span className="text-white">{digits}</span>
                  </div>
                  <p className="text-white/85 group-hover/svc:text-white transition-colors text-[12.5px] sm:text-[13.5px] font-medium">
                    {svc.title}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          TRUSTED TECH STACK & ECOSYSTEM STRIP
          Inside #121212 Rounded Bottom 42px Layer
      =========================================== */}
      <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-9 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="text-white/90 text-[11.5px] sm:text-[12px] font-semibold leading-[1.35] shrink-0">
          Core Tech Stack &amp;
          <br />
          Ecosystem I Build With
        </div>

        <div className="logo-strip-mask w-full sm:max-w-[78%] overflow-hidden py-1">
          <div
            className={
              useMarquee
                ? 'animate-marquee flex items-center gap-8 md:gap-11 pr-8'
                : 'flex items-center justify-between sm:justify-end gap-7 md:gap-11 overflow-x-auto no-scrollbar'
            }
          >
            {displayBrands.map((brand, idx) => (
              <div
                key={`${brand.id}-${idx}`}
                className="flex items-center gap-2.5 shrink-0 text-white/90 hover:text-white transition"
              >
                {brand.logo_url ? (
                  <div className="relative w-5 h-5 shrink-0 brightness-0 invert opacity-90">
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="20px"
                      unoptimized={
                        brand.logo_url.startsWith('data:') ||
                        brand.logo_url.endsWith('.svg')
                      }
                    />
                  </div>
                ) : (
                  <TechLogo
                    name={brand.name}
                    monochrome
                    className="w-5 h-5 text-white shrink-0"
                  />
                )}
                <span className="text-white font-bold text-[15px] tracking-[-0.02em] whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
