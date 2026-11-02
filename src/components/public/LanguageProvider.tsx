'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CheckCircle2 } from 'lucide-react';
import { pickLocalized, type Locale } from '@/lib/i18n/localized';
import { parseCaseStudyMarkdown } from '@/lib/markdown';
import { ScrollTextReveal } from '@/components/motion/ScrollTextReveal';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'argandhi_lang';

interface LanguageContextValue {
  lang: Locale;
  setLang: (next: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'id' || saved === 'en') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(saved);
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = 'en';
      }
    } catch {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLang = useCallback((next: Locale) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // Ignore storage quota / privacy mode restrictions
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function T({
  en,
  id,
}: {
  en: React.ReactNode;
  id: React.ReactNode;
}) {
  const { lang } = useLanguage();
  return <>{lang === 'id' ? id : en}</>;
}

export function CmsText({
  value,
  fallbackEn = '',
  fallbackId = '',
}: {
  value: string | null | undefined;
  fallbackEn?: string;
  fallbackId?: string;
}) {
  const { lang } = useLanguage();
  const resolved = pickLocalized(value, lang);
  if (resolved) return <>{resolved}</>;
  return <>{lang === 'id' ? fallbackId || fallbackEn : fallbackEn}</>;
}

export function LanguageToggle({
  variant = 'obsidian',
  className,
}: {
  variant?: 'fiery' | 'obsidian' | 'mobile';
  className?: string;
}) {
  const { lang, setLang } = useLanguage();
  const isFiery = variant === 'fiery';
  const isMobile = variant === 'mobile';

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={cn(
        'inline-flex items-center rounded-full p-0.5 select-none shrink-0',
        isFiery
          ? 'bg-black/25 backdrop-blur-md border border-white/20'
          : 'bg-[#161616] border border-white/[0.1]',
        isMobile && 'p-1',
        className
      )}
    >
      {(['en', 'id'] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-label={code === 'en' ? 'English' : 'Bahasa Indonesia'}
            aria-pressed={active}
            className={cn(
              'rounded-full font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
              isMobile
                ? 'px-3.5 py-1 text-[12px]'
                : 'px-2.5 py-1 text-[10.5px]',
              active
                ? isFiery
                  ? 'bg-white text-[#080808] shadow-sm'
                  : 'bg-[#FF5510] text-white shadow-sm'
                : 'text-white/65 hover:text-white'
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

export function LocalizedScrollTextReveal({
  enText,
  idText,
  enHighlights = [],
  idHighlights = [],
  className,
}: {
  enText: string;
  idText: string;
  enHighlights?: readonly string[];
  idHighlights?: readonly string[];
  className?: string;
}) {
  const { lang } = useLanguage();
  const activeText = lang === 'id' ? idText : enText;
  const activeHighlights = useMemo(
    () => [...(lang === 'id' ? idHighlights : enHighlights)],
    [lang, enHighlights, idHighlights]
  );

  return (
    <ScrollTextReveal
      text={activeText}
      highlightWords={activeHighlights}
      className={className}
    />
  );
}

export function LocalizedCaseStudyArticle({
  rawContent,
}: {
  rawContent: string | null | undefined;
}) {
  const { lang } = useLanguage();
  const localizedMarkdown = pickLocalized(rawContent, lang);
  const contentBlocks = useMemo(
    () => parseCaseStudyMarkdown(localizedMarkdown),
    [localizedMarkdown]
  );

  const { chapterHeadings, chapterIdByBlockIndex } = useMemo(() => {
    const headings: Array<{ id: string; num: string; title: string }> = [];
    const idMap = new Map<number, string>();

    contentBlocks.forEach((block, blockIndex) => {
      if (block.type === 'h2') {
        const chapterNum = headings.length + 1;
        const id = `chapter-${chapterNum}`;
        idMap.set(blockIndex, id);
        headings.push({
          id,
          num: String(chapterNum).padStart(2, '0'),
          title: block.text,
        });
      }
    });

    return { chapterHeadings: headings, chapterIdByBlockIndex: idMap };
  }, [contentBlocks]);

  return (
    <article className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 py-12 sm:py-16 border-t border-white/[0.08]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left 4 Columns: Sticky Chapter Outline Rail */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
          <Reveal variant="fade-up">
            <p className="text-white font-bold text-[20px] tracking-[-0.025em]">
              {lang === 'id' ? 'Ringkasan Bab' : 'Overview'}
            </p>
          </Reveal>

          {chapterHeadings.length > 0 && (
            <Reveal variant="fade-up" delay={140}>
              <nav
                aria-label="Case study chapters"
                className="border-t border-white/[0.08] pt-4 space-y-2.5"
              >
                {chapterHeadings.map((ch) => (
                  <a
                    key={ch.id}
                    href={`#${ch.id}`}
                    className="group flex items-baseline gap-3 text-[13px] text-white/60 hover:text-white transition py-1"
                  >
                    <span className="font-mono text-[11px] font-bold text-[#FF5510]">
                      {ch.num}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {ch.title}
                    </span>
                  </a>
                ))}
              </nav>
            </Reveal>
          )}
        </aside>

        {/* Right 8 Columns: Concise Structured Markdown */}
        <div className="lg:col-span-8">
          {contentBlocks.length > 0 ? (
            <div className="space-y-6 text-white/75 leading-[1.78] text-[15px] sm:text-[16px]">
              {contentBlocks.map((block, index) => {
                if (block.type === 'h2') {
                  const chapterId = chapterIdByBlockIndex.get(index);
                  return (
                    <Reveal key={`${lang}-h2-${index}`} variant="fade-up">
                      <h2
                        id={chapterId}
                        className={`scroll-mt-28 text-white font-bold text-[22px] sm:text-[27px] leading-[1.18] tracking-[-0.025em] ${
                          index > 0 ? 'pt-9 border-t border-white/[0.08]' : ''
                        }`}
                      >
                        {block.text}
                      </h2>
                    </Reveal>
                  );
                }

                if (block.type === 'h3') {
                  return (
                    <Reveal key={`${lang}-h3-${index}`} variant="fade-up">
                      <h3 className="text-white font-bold text-[18px] sm:text-[20px] leading-[1.28] tracking-[-0.02em] pt-3">
                        {block.text}
                      </h3>
                    </Reveal>
                  );
                }

                if (block.type === 'ul') {
                  return (
                    <ul
                      key={`${lang}-ul-${index}`}
                      className="space-y-3 list-none pl-0 my-4"
                    >
                      {block.items.map((it, i) => {
                        const colonIdx = it.indexOf(':');
                        const hasLead = colonIdx > 0 && colonIdx < 70;

                        return (
                          <Reveal
                            key={`${lang}-li-${i}`}
                            as="li"
                            variant="fade-up"
                            delay={i * 75}
                            className="flex items-start gap-3.5 text-white/80 text-[14.5px] sm:text-[15px] leading-[1.65] rounded-2xl bg-[#111111] border border-white/[0.07] p-4"
                          >
                            <CheckCircle2 className="h-4 w-4 text-[#FF5510] shrink-0 mt-1" />
                            <span>
                              {hasLead ? (
                                <>
                                  <strong className="text-white font-semibold">
                                    {it.slice(0, colonIdx + 1)}
                                  </strong>
                                  {it.slice(colonIdx + 1)}
                                </>
                              ) : (
                                it
                              )}
                            </span>
                          </Reveal>
                        );
                      })}
                    </ul>
                  );
                }

                return (
                  <Reveal key={`${lang}-p-${index}`} variant="fade-up">
                    <p className="text-white/75 leading-[1.78]">{block.text}</p>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] bg-[#121212] border border-white/[0.07] p-8 text-center text-[#7A7A7A] text-[14px]">
              {lang === 'id'
                ? 'Detail proyek segera hadir.'
                : 'Case study details coming soon.'}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
