import React from 'react';

interface TechLogoProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  monochrome?: boolean;
}

export function TechLogo({
  name,
  monochrome = false,
  className = 'h-5 w-5',
  ...props
}: TechLogoProps) {
  const normalized = name.toLowerCase().trim();

  // Next.js
  if (normalized.includes('next')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <circle
          cx="12"
          cy="12"
          r="10.2"
          fill={monochrome ? 'none' : '#000000'}
          stroke={monochrome ? 'currentColor' : '#333333'}
          strokeWidth={monochrome ? '2' : '1'}
        />
        <path
          d="M16.2 17.5L8.2 7.5H6.5V16.5H8V9.3L15.2 18.2C15.5 18 15.9 17.7 16.2 17.5Z"
          fill={monochrome ? 'currentColor' : '#ffffff'}
        />
        <rect x="15" y="7.5" width="1.5" height="9" fill={monochrome ? 'currentColor' : '#ffffff'} />
      </svg>
    );
  }

  // React
  if (normalized.includes('react')) {
    const stroke = monochrome ? 'currentColor' : '#61DAFB';
    return (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} fill="none" {...props}>
        <circle cx="0" cy="0" r="2.05" fill={stroke} />
        <g stroke={stroke} strokeWidth="1.2" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // Flutter
  if (normalized.includes('flutter')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M14.2 2.5L3 13.7l3.5 3.5L21.2 2.5h-7zM14.2 11.5L8.7 17l5.5 5.5h7l-5.5-5.5 5.5-5.5h-7z"
          fill={monochrome ? 'currentColor' : '#02569B'}
        />
        <path
          d="M14.2 11.5l-3 3 2.5 2.5 3-3-2.5-2.5z"
          fill={monochrome ? 'currentColor' : '#0175C2'}
          fillOpacity={monochrome ? '0.75' : '1'}
        />
        <path
          d="M13.7 17l3.5 3.5 4-4-3.5-3.5-4 4z"
          fill={monochrome ? 'currentColor' : '#29B6F6'}
          fillOpacity={monochrome ? '0.9' : '1'}
        />
      </svg>
    );
  }

  // Supabase
  if (normalized.includes('supabase')) {
    const fill = monochrome ? 'currentColor' : '#3ECF8E';
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M13.3 22.8c-.8.9-2.3.4-2.4-.8l-.8-9.1h8.7c1.3 0 1.9 1.5 1 2.4l-6.5 7.5z"
          fill={fill}
        />
        <path
          d="M10.7 1.2c.8-.9 2.3-.4 2.4.8l.8 9.1H5.2c-1.3 0-1.9-1.5-1-2.4l6.5-7.5z"
          fill={fill}
          fillOpacity="0.65"
        />
      </svg>
    );
  }

  // Tailwind CSS
  if (normalized.includes('tailwind')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M12 6c-3.6 0-5.4 1.8-5.4 5.4 1.2-1.8 2.7-2.4 4.5-1.8 1.2.4 2.1 1.3 3.1 2.3 1.7 1.7 3.7 3.7 8.6 3.7 3.6 0 5.4-1.8 5.4-5.4-1.2 1.8-2.7 2.4-4.5 1.8-1.2-.4-2.1-1.3-3.1-2.3C18.9 8 16.9 6 12 6zM2.8 14.8c-3.6 0-5.4 1.8-5.4 5.4 1.2-1.8 2.7-2.4 4.5-1.8 1.2.4 2.1 1.3 3.1 2.3 1.7 1.7 3.7 3.7 8.6 3.7 3.6 0 5.4-1.8 5.4-5.4-1.2 1.8-2.7 2.4-4.5 1.8-1.2-.4-2.1-1.3-3.1-2.3-1.7-1.7-3.7-3.7-8.6-3.7z"
          fill={monochrome ? 'currentColor' : '#38BDF8'}
          transform="scale(0.85) translate(2, 0)"
        />
      </svg>
    );
  }

  // TypeScript
  if (normalized.includes('typescript') || normalized === 'ts') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <rect
          width="22"
          height="22"
          x="1"
          y="1"
          rx="4"
          fill={monochrome ? 'none' : '#3178C6'}
          stroke={monochrome ? 'currentColor' : 'none'}
          strokeWidth={monochrome ? '2' : '0'}
        />
        <path
          d="M11.5 14.5c-.3.8-.8 1.4-1.5 1.8-.7.4-1.6.6-2.6.6-1.5 0-2.6-.5-3.4-1.4-.8-.9-1.2-2.2-1.2-3.8 0-1.7.4-3 1.3-3.9.9-.9 2-1.4 3.5-1.4 1 0 1.9.2 2.6.7.7.5 1.2 1.1 1.4 2h-1.8c-.2-.5-.5-.9-.9-1.2-.4-.3-1-.4-1.7-.4-1 0-1.8.3-2.3 1-.5.7-.8 1.8-.8 3.2 0 1.5.3 2.5.8 3.2.5.7 1.3 1 2.3 1 .6 0 1.2-.2 1.6-.5.4-.3.7-.8.9-1.5h1.7zm10.7-3.2c0 1.2-.4 2.2-1.1 2.9-.7.7-1.8 1-3.2 1h-3.6v-7.8h3.6c1.3 0 2.4.3 3.1 1 .8.7 1.2 1.7 1.2 2.9zm-1.8 0c0-.8-.2-1.4-.7-1.8-.5-.4-1.2-.6-2.2-.6h-1.6v4.8h1.6c1 0 1.7-.2 2.2-.6.5-.4.7-1 .7-1.8z"
          fill={monochrome ? 'currentColor' : '#ffffff'}
        />
      </svg>
    );
  }

  // Firebase
  if (normalized.includes('firebase')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M4.6 15.8L7.3 2.8c.1-.5.8-.7 1.1-.3l3.2 6.1-7 7.2z"
          fill={monochrome ? 'currentColor' : '#FFA000'}
          fillOpacity={monochrome ? '0.7' : '1'}
        />
        <path
          d="M13.7 3.4c.4-.5 1.2-.3 1.3.3l1.8 10.3-3.1-10.6z"
          fill={monochrome ? 'currentColor' : '#F57C00'}
          fillOpacity={monochrome ? '0.85' : '1'}
        />
        <path
          d="M16.5 13.7l-4.1-10.9c-.2-.5-.9-.6-1.2-.1l-7.8 14.8 13.1-3.8z"
          fill={monochrome ? 'currentColor' : '#FFCA28'}
        />
        <path
          d="M3.4 18l.8-2.6 7.4 7.2c.4.4.9.4 1.3 0l7.7-7.2.3 1.9c.2 1.5-.9 2.9-2.4 2.9H5.5c-1.2 0-2.1-.9-2.1-2.2z"
          fill={monochrome ? 'currentColor' : '#FFA000'}
        />
      </svg>
    );
  }

  // PostgreSQL
  if (normalized.includes('postgres')) {
    const stroke = monochrome ? 'currentColor' : '#336791';
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M12 3C7 3 3 6.5 3 11c0 2.5 1.5 5 4 6.5V21l4-2c.3 0 .7.1 1 .1 5 0 9-3.5 9-8s-4-9-9-9z"
          stroke={stroke}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path d="M8 12c.5 1.5 2 2 4 2s3.5-.5 4-2" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  // Astro
  if (normalized.includes('astro')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M8.5 19a6.5 6.5 0 0 1 7 0M12 2.5v3.5m0 0a6 6 0 0 1 6 6c0 3-2 5.5-6 6.5-4-1-6-3.5-6-6.5a6 6 0 0 1 6-6z"
          stroke={monochrome ? 'currentColor' : '#FF5D01'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Vercel
  if (normalized.includes('vercel')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}>
        <path d="M12 2L24 22H0L12 2Z" />
      </svg>
    );
  }

  // Shadcn UI
  if (normalized.includes('shadcn')) {
    return (
      <svg viewBox="0 0 256 256" className={className} fill="none" {...props}>
        <line
          x1="208"
          y1="128"
          x2="128"
          y2="208"
          stroke="currentColor"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="192"
          y1="40"
          x2="40"
          y2="192"
          stroke="currentColor"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Node.js
  if (normalized.includes('node')) {
    const color = monochrome ? 'currentColor' : '#68A063';
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2z" stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
        <circle cx="12" cy="12.4" r="3" fill={color} />
      </svg>
    );
  }

  // Python
  if (normalized.includes('python')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path
          d="M11.9 2c-3.1 0-5.1.7-5.1 2.8v2.1h5.2V8H4.6C2.6 8 1 9.4 1 12.3c0 2.7 1.4 4.3 3.6 4.3h1.8v-2.3c0-2.3 2-4.1 4.5-4.1h5.1V7c0-2.8-2.6-5-4.1-5zm-1.8 1.6a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z"
          fill={monochrome ? 'currentColor' : '#3776AB'}
        />
        <path
          d="M12.1 22c3.1 0 5.1-.7 5.1-2.8v-2.1h-5.2V16h7.4c2 0 3.6-1.4 3.6-4.3 0-2.7-1.4-4.3-3.6-4.3h-1.8v2.3c0-2.3-2 4.1-4.5 4.1H8V17c0 2.8 2.6 5 4.1 5zm1.8-1.6a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z"
          fill={monochrome ? 'currentColor' : '#FFD43B'}
          fillOpacity={monochrome ? '0.75' : '1'}
        />
      </svg>
    );
  }

  // Generic fallback geometric mark (matches HTML brand mark style)
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5V2.5Z" fill="currentColor" />
    </svg>
  );
}
