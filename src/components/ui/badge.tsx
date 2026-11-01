import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'neutral';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-white text-zinc-950 shadow hover:bg-white/90',
    secondary: 'border-transparent bg-zinc-900 text-zinc-200 hover:bg-zinc-850',
    outline: 'border-zinc-800 text-zinc-400 bg-transparent',
    neutral: 'border-zinc-800/80 bg-zinc-900/60 text-zinc-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
