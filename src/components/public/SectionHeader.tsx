import React from 'react';
import { PillButton } from '@/components/public/PillButton';
import { GsapSplitText } from '@/components/motion/GsapSplitText';
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
      {/* Left Column: Eyebrow + Large Editorial H2 Title with GSAP Masked Word Reveal */}
      <div className="md:col-span-6">
        <p className="text-[#9E1B32] font-semibold text-[15px] sm:text-[16px] leading-[1.3] tracking-[-0.01em] mb-2.5">
          <GsapSplitText stagger={0.04} duration={0.65}>
            {eyebrow}
          </GsapSplitText>
        </p>
        <h2
          style={{ color: 'var(--sec-fg, #ffffff)' }}
          className="font-bold text-[34px] sm:text-[46px] leading-[1.06] tracking-[-0.035em]"
        >
          <GsapSplitText stagger={0.038} duration={0.82}>
            {heading}
          </GsapSplitText>
        </h2>
        {badge && <div className="mt-4">{badge}</div>}
      </div>

      {/* Right Column: Concise Lead Statement with GSAP Word Reveal + Direct CTA */}
      <div className="md:col-span-6 md:pl-6 flex flex-col justify-between h-full pt-1">
        <div
          style={{ color: 'var(--sec-muted, rgba(255, 255, 255, 0.85))' }}
          className="font-medium text-[17px] sm:text-[20px] leading-[1.45] tracking-[-0.015em] mb-6"
        >
          <GsapSplitText stagger={0.02} duration={0.7} delay={0.08}>
            {lead}
          </GsapSplitText>
        </div>

        {ctaHref && ctaLabel && (
          <Reveal variant="fade-up" delay={140} className="flex items-center pt-1">
            <PillButton href={ctaHref} variant="orange">
              {ctaLabel}
            </PillButton>
          </Reveal>
        )}
      </div>
    </div>
  );
}
