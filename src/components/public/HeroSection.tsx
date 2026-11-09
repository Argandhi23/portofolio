import type { SiteSettings, Service, Brand } from '@/types/database.types';
import { decodeLocalized } from '@/lib/i18n/localized';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { HeroSilhouette } from '@/components/public/HeroSilhouette';
import { CmsText, T } from '@/components/public/LanguageProvider';
import { HeroAmbientGlow } from '@/components/motion/HeroAmbientGlow';
import { Reveal } from '@/components/motion/Reveal';
import { StackLogo } from '@/components/ui/StackLogo';

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

function renderSplitHeading(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) {
    return (
      <>
        {words[0]}{' '}
        <br />
        {words.slice(1).join(' ')}
      </>
    );
  }
  return title;
}

export function HeroSection({ settings, services, brands }: HeroSectionProps) {
  const brandName = settings.brand_name || 'Argandhi.';
  const ctaUrl = settings.cta_url || '#contact';

  const titlePair = decodeLocalized(
    settings.hero_title || 'Software Developer'
  );

  const useMarquee = brands.length > 5;
  const displayBrands = useMarquee ? [...brands, ...brands] : brands;

  return (
    <div
      id="home"
      className="
        relative z-10 flex min-h-[100svh] flex-col justify-between
        rounded-b-[42px] border-b border-white/[0.06] bg-[#121212] pb-4 sm:pb-5
      "
    >
      {/* ==========================================
          HERO CARD (Fiery Radial Gradient + Rounded Bottom 42px)
      =========================================== */}
      <section
        className="
          hero-card flex flex-1 flex-col justify-between px-6 pt-6 pb-8
          sm:px-12 sm:pt-7 sm:pb-10
        "
      >
        {/* Interactive Damped Studio Glow + Bottom Vignette */}
        <HeroAmbientGlow />
        <div className="hero-glow-bottom" aria-hidden="true" />

        {/* Center Studio 3D Silhouette */}
        <HeroSilhouette />

        {/* 1. TOP NAVBAR */}
        <div
          data-gp-front="nav"
          style={{
            transform: 'translate(0, calc(var(--gp-scrub, 0) * -26px))',
          }}
          className="relative z-20"
        >
          <PublicNavbar brandName={brandName} ctaUrl={ctaUrl} />
        </div>

        {/* 2. HERO CENTER CONTENT (Choreographed Staggered Reveal + Smooth Scroll-Scrubbed Exit) */}
        <div
          data-gp-front="center"
          className="
            relative z-10 mx-auto my-auto grid w-full max-w-[1140px]
            grid-cols-1 items-end gap-8 pt-10 pb-8 md:grid-cols-12 sm:pt-12 sm:pb-10
          "
        >
          {/* Left Main Display Heading */}
          <div
            style={{
              transform:
                'translate(calc(var(--gp-scrub, 0) * -52px), calc(var(--gp-scrub, 0) * -34px)) scale(calc(1 - var(--gp-scrub, 0) * 0.04))',
            }}
            className="md:col-span-7 origin-left"
          >
            <Reveal variant="fade-up" delay={0}>
              <p className="text-white/95 text-[20px] sm:text-[23px] font-semibold tracking-[-0.02em] mb-2">
                <CmsText
                  value={settings.hero_greeting}
                  fallbackEn="Hi, I'm Faqih Rafasha"
                  fallbackId="Halo, saya Faqih Rafasha"
                />
              </p>
            </Reveal>

            <Reveal variant="mask-up" delay={120}>
              <h1 className="text-white font-bold text-[54px] sm:text-[76px] lg:text-[84px] leading-[0.93] tracking-[-0.04em]">
                <T
                  en={renderSplitHeading(titlePair.en)}
                  id={renderSplitHeading(titlePair.id)}
                />
              </h1>
            </Reveal>
          </div>

          {/* Right Supporting Statement */}
          <div
            style={{
              transform:
                'translate(calc(var(--gp-scrub, 0) * 52px), calc(var(--gp-scrub, 0) * -26px)) scale(calc(1 - var(--gp-scrub, 0) * 0.04))',
            }}
            className="md:col-span-5 md:pl-8 pb-1 origin-right"
          >
            <Reveal variant="fade-up" delay={360}>
              <h2 className="text-white font-bold text-[20px] sm:text-[24px] leading-[1.22] tracking-[-0.02em] mb-2.5 max-w-[300px]">
                <CmsText
                  value={settings.hero_subtitle}
                  fallbackEn="Clean code. Fast products."
                  fallbackId="Kode bersih. Produk cepat."
                />
              </h2>
              <p className="text-white/75 text-[13px] sm:text-[14px] leading-[1.55] max-w-[300px] font-normal">
                <CmsText
                  value={settings.hero_description}
                  fallbackEn="Building web apps, Flutter APKs, and AI tools."
                  fallbackId="Membangun aplikasi web, APK Flutter, dan sistem AI."
                />
              </p>
            </Reveal>
          </div>
        </div>

        {/* 3. HERO BOTTOM 4-COLUMN SERVICES ROW (#01 - #04) */}
        <div
          data-gp-front="services"
          style={{
            transform: 'translate(0, calc(var(--gp-scrub, 0) * 28px))',
          }}
          className="relative z-10 w-full max-w-[1140px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 pt-3"
        >
          {services.map((svc, idx) => {
            const { hash, digits } = splitServiceNumber(svc.number_label);
            return (
              <Reveal key={svc.id} variant="fade-up" delay={460 + idx * 110}>
                <div className="group/svc">
                  <div className="text-[12.5px] sm:text-[13px] font-bold tracking-tight mb-1">
                    <span className="text-[#9E1B32]">{hash}</span>
                    <span className="text-white">{digits}</span>
                  </div>
                  <p className="text-white/85 group-hover/svc:text-white transition-colors text-[12.5px] sm:text-[13.5px] font-medium">
                    <CmsText value={svc.title} />
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          TECH STACK STRIP
      =========================================== */}
      <div
        data-gp-front="tech"
        style={{
          transform: 'translate(0, calc(var(--gp-scrub, 0) * 34px))',
        }}
        className="
          mx-auto flex w-full max-w-[1140px] flex-col items-start
          justify-between gap-4 px-6 pt-4 pb-1 sm:flex-row
          sm:items-center sm:gap-6 sm:px-12 sm:pt-5
        "
      >
        <div className="text-white/85 text-[12px] font-semibold tracking-tight shrink-0">
          <T en="Tech Stack" id="Tech Stack" />
        </div>

        <div className="logo-strip-mask w-full sm:max-w-[84%] overflow-hidden py-1">
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
                  className="group/stack flex items-center gap-2.5 shrink-0 text-white/90 hover:text-white transition"
              >
                  <StackLogo name={brand.name} logoUrl={brand.logo_url} className="w-5 h-5" />
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
