'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';

interface CopyEmailButtonProps {
  email: string;
}

export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] border border-white/[0.08] hover:border-[#FF5510]/45 px-3 py-1 text-[11px] font-semibold text-white/80 hover:text-white transition cursor-pointer"
      title={lang === 'id' ? 'Salin email' : 'Copy email'}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-[#FF5510]" />
          <span className="text-[#FF5510]">
            {lang === 'id' ? 'Tersalin' : 'Copied'}
          </span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-white/60" />
          <span>{lang === 'id' ? 'Salin' : 'Copy'}</span>
        </>
      )}
    </button>
  );
}
