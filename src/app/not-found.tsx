import Link from 'next/link';
import { PillButton } from '@/components/public/PillButton';

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

        <div className="relative z-10 w-full max-w-[1140px] mx-auto my-auto py-16 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white">
            <span className="text-[#FF5510] font-bold">#404</span>
            <span>Route Not Found</span>
          </span>

          <h1 className="text-white font-bold text-[48px] sm:text-[74px] leading-[0.95] tracking-[-0.04em] max-w-2xl">
            This Page Has Moved or Doesn&apos;t Exist.
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
            Halaman atau studi kasus yang kamu cari tidak ditemukan. Mari kembali ke halaman utama portofolio.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <PillButton href="/" variant="white">
              Back to Home
            </PillButton>
            <PillButton href="/projects" variant="orange">
              Browse Projects
            </PillButton>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[1140px] mx-auto text-xs text-white/65">
          Faqih Rafasha Argandhi &bull; Full-Stack &amp; Software Developer
        </div>
      </div>
    </main>
  );
}
