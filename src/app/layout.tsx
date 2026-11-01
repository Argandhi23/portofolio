import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getPublicEnv } from '@/lib/env';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const siteUrl = (() => {
  try {
    return getPublicEnv().NEXT_PUBLIC_SITE_URL;
  } catch {
    return 'http://localhost:3000';
  }
})();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      'Faqih Rafasha Argandhi (Argandhi.) — Full-Stack Developer & Informatics Student',
    template: '%s',
  },
  description:
    "Official portfolio of Faqih Rafasha Argandhi. S1 Informatics Engineering UNESA '24 & Freelance Full-Stack Developer specializing in Next.js, Flutter, and AI Systems.",
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Argandhi.',
    title:
      'Faqih Rafasha Argandhi (Argandhi.) — Full-Stack & Software Developer',
    description:
      "Full-Stack Web (Next.js & Supabase), Mobile App (Flutter APK), and AI Systems Engineering portfolio of Faqih Rafasha Argandhi (UNESA '24).",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased dark scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white font-sans selection:bg-[#FF5510] selection:text-white">
        {children}
      </body>
    </html>
  );
}
