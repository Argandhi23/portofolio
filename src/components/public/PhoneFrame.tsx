'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/public/ImageLightbox';

interface PhoneFrameProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  showGlow?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

/**
 * Realistic smartphone mockup frame for Flutter mobile apps.
 * Features curved chassis, titanium rim gradient, speaker/dynamic island,
 * volume & power keys, and glass reflection.
 */
export function PhoneFrame({
  src,
  alt,
  caption,
  priority = false,
  className,
  showGlow = false,
  size = 'md',
}: PhoneFrameProps) {
  const sizeClasses = {
    sm: 'max-w-[240px]',
    md: 'max-w-[320px]',
    lg: 'max-w-[380px]',
    hero: 'max-w-[340px] sm:max-w-[380px]',
  }[size];

  return (
    <div
      data-phone-frame="true"
      className={cn(
        'relative w-full mx-auto select-none transition-transform duration-500',
        sizeClasses,
        className
      )}
    >
      {/* Optional ambient orange/warm glow behind the phone */}
      {showGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[60px] bg-[#9E1B32]/15 blur-3xl"
        />
      )}

      {/* Hardware Volume Buttons (Left Side) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[3px] top-[108px] h-9 w-[3px] rounded-l-[2px] bg-gradient-to-b from-[#4A4A4A] via-[#2A2A2A] to-[#3A3A3A] shadow-sm"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[3px] top-[154px] h-9 w-[3px] rounded-l-[2px] bg-gradient-to-b from-[#4A4A4A] via-[#2A2A2A] to-[#3A3A3A] shadow-sm"
      />

      {/* Hardware Power Button (Right Side) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[3px] top-[128px] h-12 w-[3px] rounded-r-[2px] bg-gradient-to-b from-[#4A4A4A] via-[#2A2A2A] to-[#3A3A3A] shadow-sm"
      />

      {/* Outer Titanium Chassis */}
      <div className="relative rounded-[42px] sm:rounded-[46px] p-[3px] bg-gradient-to-b from-[#4D4D4D] via-[#202020] to-[#383838] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* Inner Bezel Ring */}
        <div className="relative rounded-[39px] sm:rounded-[43px] p-2 sm:p-2.5 bg-[#0B0B0B] border border-black shadow-inner">
          
          {/* Screen Glass Wrapper */}
          <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[31px] sm:rounded-[35px] bg-[#0A0A0A]">
            
            {/* Dynamic Island Pill (Hardware Notch) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-2 sm:top-2.5 z-30 -translate-x-1/2 flex items-center justify-end h-5 sm:h-5.5 w-24 sm:w-28 rounded-full bg-[#050505] border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-2"
            >
              {/* Camera Lens Reflection Dot */}
              <span className="h-2 w-2 rounded-full bg-[#0C1527] ring-1 ring-white/10" />
            </div>

            {/* Screen Image with Lightbox */}
            <ImageLightbox
              src={src}
              alt={alt}
              caption={caption || alt}
              className="h-full w-full"
            >
              <div className="relative h-full w-full cursor-zoom-in">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority={priority}
                  className="object-cover object-top transition-transform duration-700 ease-out hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, 380px"
                  unoptimized={src.startsWith('data:') || src.endsWith('.svg')}
                />
              </div>
            </ImageLightbox>

            {/* Glass Glare / Gloss Highlight (Subtle angled reflection across screen) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.05]"
            />

            {/* Bottom Home Indicator Bar */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1.5 sm:bottom-2 left-1/2 z-30 -translate-x-1/2 h-1 w-28 sm:w-32 rounded-full bg-white/35 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
