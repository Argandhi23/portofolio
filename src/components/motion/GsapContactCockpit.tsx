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

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (contactGrid && leftWing) {
        gsap.timeline({
          scrollTrigger: { trigger: contactGrid, start: 'top 94%', end: 'top 48%', scrub: 0.65 },
        })
          .fromTo(leftWing, { y: 65, clipPath: 'inset(0% 0% 100% 0%)' }, {
            y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.out',
          }, 0)
          .fromTo(contactLines, { scaleX: 0 }, {
            scaleX: 1, stagger: 0.08, duration: 0.7, ease: 'power2.inOut',
          }, 0.1)
          .fromTo(rightRows, { x: 35, autoAlpha: 0 }, {
            x: 0, autoAlpha: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out',
          }, 0.15);
      }
      const footer = root.querySelector('footer');
      if (footer && footerChars.length) {
        gsap.fromTo(footerChars, {
          yPercent: 115, rotation: 8, transformOrigin: '0% 100%',
        }, {
          yPercent: 0, rotation: 0, stagger: { each: 0.045, from: 'start' },
          duration: 1, ease: 'power4.out',
          scrollTrigger: { trigger: footer, start: 'top 92%', end: 'clamp(top 30%)', scrub: 0.65 },
        });
      }
    }, root);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!magneticWrap || prefersReduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return () => mm.revert();
    }

    const onMouseMove = (e: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = magneticWrap.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      gsap.to(magneticWrap, {
        x: relX * 0.22,
        y: relY * 0.22,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const onMouseLeave = () => {
      gsap.to(magneticWrap, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    magneticWrap.addEventListener('mousemove', onMouseMove);
    magneticWrap.addEventListener('mouseleave', onMouseLeave);

    return () => {
      magneticWrap.removeEventListener('mousemove', onMouseMove);
      magneticWrap.removeEventListener('mouseleave', onMouseLeave);
      gsap.killTweensOf(magneticWrap);
      mm.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
