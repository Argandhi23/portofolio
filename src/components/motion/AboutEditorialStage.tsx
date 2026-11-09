'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Owns editorial blocks only, leaving the eye camera and gallery untouched. */
export function AboutEditorialStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 768px)' }, (context) => {
      if (!context.conditions?.motion) return;
      Array.from(root.children).forEach((block, index) => {
        gsap.fromTo(block, {
          clipPath: 'inset(0% 0% 100% 0%)',
          y: context.conditions?.desktop ? 65 : 28,
          rotateX: context.conditions?.desktop ? 4 : 0,
          transformPerspective: 1100, transformOrigin: '50% 0%',
        }, {
          clipPath: 'inset(0% 0% -5% 0%)', y: 0, rotateX: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: block, start: 'top 96%', end: index === 0 ? 'top 42%' : 'top 58%', scrub: 0.65 },
        });
      });
    }, root);
    return () => mm.revert();
  }, []);
  return <div ref={rootRef} className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pt-24 sm:pt-32 pb-20 sm:pb-28 space-y-14">{children}</div>;
}
