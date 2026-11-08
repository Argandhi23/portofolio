'use client';

import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';

interface CopyEmailButtonProps {
  email: string;
}

export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!copied && !copyFailed) return;
    const timer = window.setTimeout(() => { setCopied(false); setCopyFailed(false); }, 2000);
    return () => window.clearTimeout(timer);
  }, [copied, copyFailed]);

  const handleCopy = async () => {
    setCopied(false);
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] border border-white/[0.08] hover:border-[#9E1B32]/45 px-3 py-1 text-[11px] font-semibold text-white/80 hover:text-white transition cursor-pointer"
      aria-live="polite"
      title={lang === 'id' ? 'Salin email' : 'Copy email'}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-[#9E1B32]" />
          <span className="text-[#9E1B32]">
            {lang === 'id' ? 'Tersalin' : 'Copied'}
          </span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-white/60" />
          <span>{copyFailed ? (lang === 'id' ? 'Gagal menyalin' : 'Copy failed') : (lang === 'id' ? 'Salin' : 'Copy')}</span>
        </>
      )}
    </button>
  );
}
