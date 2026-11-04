'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';
import { cn } from '@/lib/utils';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Interactive high-resolution lightbox modal for inspecting UI/architecture screenshots.
 * Uses React Portal into document.body to prevent containing-block traps caused by parent CSS transforms.
 */
export function ImageLightbox({
  src,
  alt,
  caption,
  className,
  children,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const modal = open && mounted ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      data-lenis-prevent
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
    >
      {/* Top action bar with clear Close button */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-10 flex items-center gap-3">
        <button
          type="button"
          aria-label="Close image preview"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] border border-white/20 text-white hover:bg-[#9E1B32] hover:border-[#9E1B32] transition-colors cursor-pointer shadow-xl"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Responsive Viewport Image Canvas */}
      <div
        onClick={() => setOpen(false)}
        className="relative w-full max-w-5xl h-[70vh] sm:h-[78vh] rounded-[20px] overflow-hidden border border-white/15 bg-[#0B0B0B] shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex items-center justify-center cursor-zoom-out"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain p-2 sm:p-4 select-none"
          sizes="100vw"
          unoptimized={src.startsWith('data:') || src.endsWith('.svg')}
        />
      </div>

      {(caption || alt) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 px-4 py-2 rounded-full bg-[#121212]/90 border border-white/10 text-center text-xs sm:text-[13px] font-medium text-white/80 max-w-2xl cursor-default"
        >
          {caption || alt}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Zoom image: ${alt}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          'relative w-full cursor-zoom-in group focus:outline-none',
          className
        )}
      >
        {children}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white/90 shadow-lg group-hover:scale-105 group-hover:border-[#9E1B32]/50 group-hover:text-white transition-all duration-200"
        >
          <Maximize2 className="h-3 w-3 text-[#9E1B32]" />
          <span>{lang === 'id' ? 'Perbesar' : 'Zoom'}</span>
        </span>
      </div>

      {mounted && typeof document !== 'undefined' && modal
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
