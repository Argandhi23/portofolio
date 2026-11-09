import Image from 'next/image';
import { TechLogo } from '@/components/ui/TechLogos';
import { cn } from '@/lib/utils';

/** White at rest; the stack item's hover restores the original artwork colors. */
export function StackLogo({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-block shrink-0 text-white brightness-0 invert opacity-80 transition-[filter,opacity] duration-300 group-hover/stack:brightness-100 group-hover/stack:invert-0 group-hover/stack:opacity-100 motion-reduce:transition-none',
        className
      )}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          fill
          className="object-contain"
          sizes="20px"
          unoptimized={logoUrl.startsWith('data:') || logoUrl.endsWith('.svg')}
        />
      ) : (
        <TechLogo name={name} className="h-full w-full" />
      )}
    </span>
  );
}
