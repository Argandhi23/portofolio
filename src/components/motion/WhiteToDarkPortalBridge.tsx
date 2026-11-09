'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Continuous curved ink wipe; does not pin or affect the project stage. */
export function WhiteToDarkPortalBridge() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const curve = root.querySelector('[data-bridge-curve]');
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top 95%', end: 'bottom 65%', scrub: 0.65, invalidateOnRefresh: true },
      })
        .fromTo(curve, { attr: { d: 'M0,100 Q50,-45 100,100 L100,100 L0,100 Z' } }, {
          attr: { d: 'M0,0 Q50,0 100,0 L100,100 L0,100 Z' }, duration: 1, ease: 'power2.inOut',
        }, 0);
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} data-portal-bridge aria-hidden="true"
      className="relative h-[clamp(64px,12svh,144px)] w-full overflow-hidden bg-[#F5F0EB] select-none">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path data-bridge-curve data-portal-bridge-monolith fill="#080808" d="M0,0 Q50,0 100,0 L100,100 L0,100 Z" />
      </svg>
    </div>
  );
}
