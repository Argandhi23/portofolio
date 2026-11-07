'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GsapContactCockpitProps {
  children: React.ReactNode;
}

/**
 * Minimalist Editorial GSAP Controller for Contact & Footer (#contact).
 * - Animates hairline dividers (`scaleX: 0 -> 1`), contact rows, and form entrance.
 * - Drives masked character slide-up on "Let's Talk." and subtle magnetic hover on the CTA.
 */
export function GsapContactCockpit({ children }: GsapContactCockpitProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const contactGrid = root.querySelector<HTMLElement>(
      '[data-gsap-cockpit-grid]'
    );
    const leftWing = root.querySelector<HTMLElement>(
      '[data-gsap-cockpit-left]'
    );
    const rightRows = Array.from(
      root.querySelectorAll<HTMLElement>('[data-gsap-cockpit-right]')
    );
    const contactLines = Array.from(
      root.querySelectorAll<HTMLElement>('[data-gsap-contact-line]')
    );
    const footerChars = Array.from(
      root.querySelectorAll<HTMLElement>('[data-gsap-footer-char]')
    );
    const magneticWrap = root.querySelector<HTMLElement>(
      '[data-gsap-magnetic-cta]'
    );

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      if (contactGrid) {
        if (leftWing) {
          gsap.fromTo(
            leftWing,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: contactGrid,
                start: 'top 86%',
              },
            }
          );
        }

        if (contactLines.length > 0) {
          gsap.fromTo(
            contactLines,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: contactGrid,
                start: 'top 86%',
              },
            }
          );
        }

        if (rightRows.length > 0) {
          gsap.fromTo(
            rightRows,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: contactGrid,
                start: 'top 86%',
              },
            }
          );
        }
      }

      const footerEl = root.querySelector('footer');
      if (footerEl && footerChars.length > 0) {
        ScrollTrigger.create({
          trigger: footerEl,
          start: 'top 95%',
          end: 'bottom bottom',
          scrub: 0.35,
          onUpdate: (self) => {
            const p = self.progress;
            const count = footerChars.length;
            footerChars.forEach((ch, idx) => {
              const start = (idx / count) * 0.35;
              const local = Math.min(1, Math.max(0, (p - start) / 0.55));
              const eased = 1 - Math.pow(1 - local, 3);
              const y = (1 - eased) * 28;
              ch.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
            });
          },
        });
      }
    }, root);

    if (!magneticWrap || prefersReduced) {
      return () => ctx.revert();
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = magneticWrap.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      gsap.to(magneticWrap, {
        x: relX * 0.22,
        y: relY * 0.22,
        duration: 0.35,
        ease: 'power3.out',
      });
    };

    const onMouseLeave = () => {
      gsap.to(magneticWrap, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    };

    magneticWrap.addEventListener('mousemove', onMouseMove);
    magneticWrap.addEventListener('mouseleave', onMouseLeave);

    return () => {
      magneticWrap.removeEventListener('mousemove', onMouseMove);
      magneticWrap.removeEventListener('mouseleave', onMouseLeave);
      ctx.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
