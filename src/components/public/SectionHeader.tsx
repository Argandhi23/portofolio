import React from 'react';
import { PillButton } from '@/components/public/PillButton';
import { Reveal } from '@/components/motion/Reveal';

interface SectionHeaderProps {
  eyebrow: React.ReactNode;
  heading: React.ReactNode;
  lead: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: React.ReactNode;
  badge?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  heading,
  lead,
  ctaHref = '#contact',
  ctaLabel,
  badge,
}: SectionHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left Column: Orange Eyebrow + Large H2 Title */}
      <Reveal variant="fade-up" className="md:col-span-6">
        <p className="text-[#9E1B32] font-semibold text-[16px] sm:text-[17px] leading-[1.3] tracking-[-0.01em] mb-2.5">
          {eyebrow}
        </p>
        <h2
          style={{ color: 'var(--sec-fg, #ffffff)' }}
          className="font-bold text-[34px] sm:text-[44px] leading-[1.08] tracking-[-0.03em]"
        >
          {heading}
        </h2>
        {badge && <div className="mt-4">{badge}</div>}
      </Reveal>

      {/* Right Column: Concise Lead Statement + Direct Pill CTA */}
      <Reveal
        variant="fade-up"
        delay={150}
        className="md:col-span-6 md:pl-6 flex flex-col justify-between h-full pt-1"
      >
        <div
          style={{ color: 'var(--sec-muted, rgba(255, 255, 255, 0.9))' }}
          className="font-semibold text-[17px] sm:text-[20px] leading-[1.42] tracking-[-0.015em] mb-6"
        >
          {lead}
        </div>

        {ctaHref && ctaLabel && (
          <div className="flex items-center pt-1">
            <PillButton href={ctaHref} variant="orange">
              {ctaLabel}
            </PillButton>
          </div>
        )}
      </Reveal>
    </div>
  );
}
