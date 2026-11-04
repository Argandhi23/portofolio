import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { HeroAmbientGlow } from '@/components/motion/HeroAmbientGlow';
import { Reveal } from '@/components/motion/Reveal';

interface CompactHeroProps {
  brandName: string;
  ctaUrl?: string;
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  badges?: React.ReactNode;
  title: string;
  summary?: string | null;
  actions?: React.ReactNode;
  bottomStrip?: React.ReactNode;
}

export function CompactHero({
  brandName,
  ctaUrl = '/#contact',
  backHref = '/',
  backLabel = 'Back to Home',
  eyebrow,
  badges,
  title,
  summary,
  actions,
  bottomStrip,
}: CompactHeroProps) {
  return (
    <div className="bg-[#121212] rounded-b-[42px] border-b border-white/[0.06] relative z-10 pb-6">
      <section className="compact-hero-card px-6 sm:px-12 pt-7 pb-12 min-h-[380px] sm:min-h-[430px] flex flex-col justify-between">
        <HeroAmbientGlow />
        <div className="hero-glow-bottom" aria-hidden="true" />

        {/* 1. TOP NAVBAR */}
        <PublicNavbar brandName={brandName} ctaUrl={ctaUrl} isSubPage />

        {/* 2. COMPACT HERO CONTENT */}
        <div className="relative z-10 w-full max-w-[1140px] mx-auto pt-12 pb-2 space-y-5">
          <Reveal variant="fade-up" delay={0}>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/90 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#9E1B32]" />
                <span>{backLabel}</span>
              </Link>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white">
                <span className="text-[#9E1B32] font-bold">#</span>
                <span>{eyebrow}</span>
              </span>

              {badges}
            </div>
          </Reveal>

          <Reveal variant="mask-up" delay={80}>
            <h1 className="text-white font-bold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-[-0.035em] max-w-4xl">
              {title}
            </h1>
          </Reveal>

          {summary && (
            <Reveal variant="fade-up" delay={150}>
              <p className="text-white/80 text-[14px] sm:text-[16px] leading-[1.6] max-w-2xl font-normal">
                {summary}
              </p>
            </Reveal>
          )}

          {actions && (
            <Reveal variant="fade-up" delay={210}>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Optional Stacked #121212 Metadata Bar */}
      {bottomStrip && (
        <div className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-7 pb-1">
          {bottomStrip}
        </div>
      )}
    </div>
  );
}
