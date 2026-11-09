'use client';

import React, { isValidElement, useEffect, useRef, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/components/public/LanguageProvider';
import { pickLocalized } from '@/lib/i18n/localized';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GsapSplitTextProps {
  children: React.ReactNode;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  style?: React.CSSProperties;
  /** Stagger delay between words in seconds (default 0.03) */
  stagger?: number;
  /** Animation duration in seconds (default 0.75) */
  duration?: number;
  /** Initial delay in seconds (default 0) */
  delay?: number;
  /** If true, scrubs word reveal directly with scroll instead of time-based trigger */
  scrub?: boolean;
}

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Resolves plain text from string, <T en id />, or <CmsText value fallbackEn fallbackId />
 * so React can render pure masked word spans without DOM mutation conflicts.
 */
function resolveNodeText(
  node: React.ReactNode,
  lang: 'en' | 'id'
): string | null {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!isValidElement(node)) return null;

  const props = node.props as Record<string, unknown>;

  // Matches <T en="..." id="..." />
  if ('en' in props && 'id' in props) {
    const chosen = lang === 'id' ? props.id : props.en;
    if (typeof chosen === 'string') return chosen;
  }

  // Matches <CmsText value="..." fallbackEn="..." fallbackId="..." />
  if ('value' in props) {
    const rawValue = props.value as string | null | undefined;
    const resolved = pickLocalized(rawValue, lang);
    if (resolved) return resolved;
    const fallbackEn =
      typeof props.fallbackEn === 'string' ? props.fallbackEn : '';
    const fallbackId =
      typeof props.fallbackId === 'string' ? props.fallbackId : '';
    return lang === 'id' ? fallbackId || fallbackEn : fallbackEn;
  }

  return null;
}

/**
 * Minimalist Awwwards GSAP Masked Word Reveal.
 * Splits sentences into overflow-hidden word masks and animates each word up with GSAP ScrollTrigger.
 */
export function GsapSplitText({
  children,
  as: Component = 'span',
  className,
  style,
  stagger = 0.03,
  duration = 0.75,
  delay = 0,
  scrub = false,
}: GsapSplitTextProps) {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLElement | null>(null);
  // RSC children can be opaque during SSR and concrete elements in the browser.
  // Keep the server and first hydration render identical; enhance only afterward.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );
  const resolvedText = hydrated ? resolveNodeText(children, lang) : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hydrated) return;

    const words = Array.from(
      el.querySelectorAll<HTMLElement>('[data-gsap-word]')
    );
    const targets = words.length > 0 ? words : [el];

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        targets,
        {
          yPercent: 110,
          rotateZ: words.length > 0 ? 2 : 0,
          opacity: 0,
        },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          duration,
          delay,
          stagger: words.length > 0 ? stagger : 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: scrub ? 'top 52%' : undefined,
            scrub: scrub ? 0.45 : false,
            toggleActions: scrub ? undefined : 'play none none none',
          },
        }
      );
    }, el);

    return () => {
      mm.revert();
    };
  }, [hydrated, lang, resolvedText, stagger, duration, delay, scrub]);

  if (resolvedText !== null) {
    const words = resolvedText.trim().split(/\s+/).filter(Boolean);

    return (
      <Component
        ref={containerRef as React.RefObject<never>}
        style={style}
        className={cn('inline', className)}
      >
        {words.map((word, idx) => (
          <React.Fragment key={`${lang}-${idx}-${word}`}>
            <span className="inline-block overflow-hidden align-bottom pb-[0.11em] -mb-[0.11em]">
              <span
                data-gsap-word
                className="inline-block origin-bottom-left will-change-transform"
              >
                {word}
              </span>
            </span>
            {idx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </Component>
    );
  }

  return (
    <Component
      ref={containerRef as React.RefObject<never>}
      style={style}
      className={cn('inline-block overflow-hidden', className)}
    >
      <span data-gsap-word className="inline-block will-change-transform">
        {children}
      </span>
    </Component>
  );
}
