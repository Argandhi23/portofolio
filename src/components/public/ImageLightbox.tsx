'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  children: React.ReactNode;
}

/**
 * Interactive high-resolution lightbox modal for inspecting UI/architecture screenshots.
 */
export function ImageLightbox({
  src,
  alt,
  caption,
  children,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

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
        className="relative cursor-zoom-in group/zoom focus:outline-none"
      >
        {children}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-200"
        >
          <Maximize2 className="h-3 w-3 text-[#FF5510]" />
          <span>Inspect UI</span>
        </span>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-8 cursor-zoom-out"
        >
          <button
            type="button"
            aria-label="Close image preview"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] border border-white/15 text-white hover:bg-[#FF5510] hover:border-[#FF5510] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl aspect-[16/10] rounded-[22px] overflow-hidden border border-white/15 bg-[#0B0B0B] shadow-2xl cursor-default"
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={src.startsWith('data:') || src.endsWith('.svg')}
            />
          </div>

          {(caption || alt) && (
            <p className="mt-4 text-center text-xs sm:text-sm font-medium text-white/80 max-w-2xl">
              {caption || alt}
            </p>
          )}
        </div>
      )}
    </>
  );
}
