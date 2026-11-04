import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'orange' | 'white' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className = '',
}: {
  variant?: 'default' | 'orange' | 'white' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
} = {}) {
  const variants = {
    default:
      'bg-[#9E1B32] text-white font-semibold hover:bg-[#7D1426] shadow-lg shadow-[#9E1B32]/20 active:scale-[0.98]',
    orange:
      'bg-[#9E1B32] text-white font-semibold hover:bg-[#7D1426] shadow-lg shadow-[#9E1B32]/20 active:scale-[0.98]',
    white:
      'bg-white text-zinc-950 font-semibold hover:bg-zinc-200 shadow-sm active:scale-[0.98]',
    secondary:
      'bg-zinc-900 text-zinc-100 hover:bg-zinc-850 border border-zinc-800 hover:border-[#9E1B32]/30',
    outline:
      'border border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-white hover:border-[#9E1B32]/40 text-zinc-300',
    ghost:
      'hover:bg-zinc-900 hover:text-white text-zinc-400',
    link:
      'text-[#9E1B32] underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 rounded-lg px-3 text-xs',
    lg: 'h-11 rounded-xl px-6 text-sm',
    icon: 'h-9 w-9',
  };

  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
    variants[variant],
    sizes[size],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
