import Link from 'next/link';
import { PillButton } from '@/components/public/PillButton';
import { T } from '@/components/public/LanguageProvider';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-4 sm:p-6">
      <div className="hero-card flex-1 rounded-[36px] sm:rounded-[42px] px-6 sm:px-12 py-10 flex flex-col justify-between">
        <div className="hero-glow-left" aria-hidden="true" />
        <div className="hero-glow-bottom" aria-hidden="true" />

        <header className="relative z-10 w-full max-w-[1140px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-white font-bold text-[20px] tracking-[-0.03em]"
          >
            Argandhi.
          </Link>
        </header>

        <div className="relative z-10 w-full max-w-[1140px] mx-auto my-auto py-16 space-y-5">
          <span className="inline-flex items-center rounded-full bg-black/30 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-bold text-[#FF5510]">
            #404
          </span>

          <h1 className="text-white font-bold text-[46px] sm:text-[72px] leading-[0.95] tracking-[-0.04em] max-w-2xl">
            <T en="Page Not Found." id="Halaman Tidak Ditemukan." />
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
            <T
              en="The page you're looking for doesn't exist."
              id="Halaman yang kamu cari tidak tersedia."
            />
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <PillButton href="/" variant="white">
              <T en="Home" id="Beranda" />
            </PillButton>
            <PillButton href="/projects" variant="orange">
              <T en="Projects" id="Proyek" />
            </PillButton>
          </div>
        </div>

        <div />
      </div>
    </main>
  );
}
