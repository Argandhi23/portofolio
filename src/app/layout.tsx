import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getPublicEnv } from '@/lib/env';
import { LanguageProvider } from '@/components/public/LanguageProvider';
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
    default: 'Faqih Rafasha Argandhi (Argandhi.) — Software Developer',
    template: '%s',
  },
  description:
    'Portfolio of Faqih Rafasha Argandhi — Full-Stack Web, Flutter Mobile APK, and AI Developer.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Argandhi.',
    title: 'Faqih Rafasha Argandhi (Argandhi.) — Software Developer',
    description:
      'Web applications, Flutter mobile APKs, and AI software by Faqih Rafasha Argandhi.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} antialiased dark`}
    >
      <body className="min-h-screen flex flex-col bg-[#080808] text-white font-sans selection:bg-[#9E1B32] selection:text-white">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
