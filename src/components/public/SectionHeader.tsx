import React from 'react';
import { PillButton } from '@/components/public/PillButton';
import { Reveal } from '@/components/motion/Reveal';

interface SectionHeaderProps {
  eyebrow: string;
  heading: React.ReactNode;
  lead: React.ReactNode;
  microLabel?: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
  badge?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  heading,
  lead,
  microLabel = (
    <>
      Let&apos;s Build Something
      <br />
      Meaningful Together
    </>
  ),
  ctaHref = '#contact',
  ctaLabel = 'Get in touch',
  badge,
}: SectionHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
      {/* Left Column: Orange Eyebrow + Large H2 Title */}
      <Reveal variant="fade-up" className="md:col-span-6">
        <p className="text-[#FF5510] font-semibold text-[17px] sm:text-[18px] leading-[1.3] tracking-[-0.01em] mb-3">
          {eyebrow}
        </p>
        <h2 className="text-white font-bold text-[36px] sm:text-[46px] leading-[1.08] tracking-[-0.03em]">
          {heading}
        </h2>
        {badge && <div className="mt-5">{badge}</div>}
      </Reveal>

      {/* Right Column: Lead Statement + Micro Label & Inverted Orange Pill CTA */}
      <Reveal
        variant="fade-up"
        delay={90}
        className="md:col-span-6 md:pl-6 flex flex-col justify-between h-full pt-1"
      >
        <div className="text-white font-semibold text-[18px] sm:text-[21.5px] leading-[1.38] tracking-[-0.015em] mb-9">
          {lead}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {microLabel && (
            <p className="text-[#7A7A7A] text-[12px] font-medium leading-[1.38]">
              {microLabel}
            </p>
          )}

          {ctaHref && ctaLabel && (
            <PillButton href={ctaHref} variant="orange">
              {ctaLabel}
            </PillButton>
          )}
        </div>
      </Reveal>
    </div>
  );
}
