import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface PillButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'white' | 'orange' | 'monochrome';
  external?: boolean;
  className?: string;
}

function ArrowSvg({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-3.5 h-3.5', className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PillButton({
  href,
  children,
  variant = 'white',
  external = false,
  className,
}: PillButtonProps) {
  const isWhite = variant === 'white';
  const isMonochrome = variant === 'monochrome';

  const pillClasses = cn(
    'pill-btn inline-flex items-center gap-3 pl-[18px] pr-1.5 py-1.5 rounded-full text-[12.5px] sm:text-[13px] font-semibold select-none transition-colors',
    isMonochrome
      ? 'bg-white text-[#0A0A0A] shadow-lg hover:bg-neutral-200'
      : isWhite
        ? 'bg-white text-[#0A0A0A] shadow-lg hover:bg-zinc-100'
        : 'bg-[#FF5510] hover:bg-[#FF6B2B] text-white shadow-lg shadow-[#FF5510]/20',
    className
  );

  const circleClasses = cn(
    'arrow-circle w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
    isMonochrome
      ? 'bg-[#0A0A0A] text-white'
      : isWhite
        ? 'bg-[#FF5510] text-white'
        : 'bg-white text-[#FF5510]'
  );

  const content = (
    <>
      <span>{children}</span>
      <span className={circleClasses}>
        <span className="arrow-track">
          <ArrowSvg className="arrow-icon-primary" />
          <ArrowSvg className="arrow-icon-Clone" />
        </span>
      </span>
    </>
  );

  const isExternalOrAnchor =
    external ||
    href.startsWith('http') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  if (isExternalOrAnchor) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={pillClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={pillClasses}>
      {content}
    </Link>
  );
}
