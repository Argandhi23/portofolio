'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/** The final sheet unfolds into a full-bleed bookend, without a scroll trap. */
export function FooterCurtain({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 768px)' }, (context) => {
      if (!context.conditions?.motion) return;
      gsap.fromTo(stage, {
        y: context.conditions?.desktop ? 100 : 35,
        clipPath: 'inset(0% 5% 0% 5% round 24px)',
        '--footer-progress': 0,
      }, {
        y: 0, clipPath: 'inset(0% 0% 0% 0% round 0px)', '--footer-progress': 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 98%', end: 'clamp(top 35%)', scrub: 0.7, invalidateOnRefresh: true },
      });
    }, root);
    return () => mm.revert();
  }, []);
  return <div ref={rootRef} className={cn('overflow-hidden', className)}><div ref={stageRef}>{children}</div></div>;
}
