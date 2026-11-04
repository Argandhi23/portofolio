'use client';

import type { Locale } from '@/lib/i18n/localized';

interface AdminLangTabsProps {
  value: Locale;
  onChange: (locale: Locale) => void;
}

export function AdminLangTabs({ value, onChange }: AdminLangTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Bahasa konten"
      className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 p-0.5 text-[11px] font-bold"
    >
      {(['en', 'id'] as const).map((lang) => {
        const active = value === lang;
        return (
          <button
            key={lang}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(lang)}
            className={`rounded-full px-2.5 py-0.5 uppercase tracking-wider transition cursor-pointer ${
              active
                ? 'bg-[#9E1B32] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
