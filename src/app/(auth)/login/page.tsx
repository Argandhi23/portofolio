import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/admin/LoginForm';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Login Admin — Argandhi.',
  description: 'Login panel admin Argandhi.',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#080808] text-white flex flex-col justify-between selection:bg-[#9E1B32] selection:text-white overflow-hidden py-10 px-4 sm:px-6">
      {/* Warm Ambient Glow Lighting */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-b from-[#9E1B32]/20 via-[#520A18]/10 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-10 h-[400px] w-[400px] rounded-full bg-[#9E1B32]/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Navbar Bar */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition group"
        >
          <span className="w-7 h-7 rounded-full bg-[#121212] border border-white/[0.08] flex items-center justify-center group-hover:border-[#9E1B32]/40 group-hover:text-[#9E1B32] transition">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          <span>Beranda</span>
        </Link>

        <Link
          href="/"
          className="text-white font-bold text-[17px] tracking-tight hover:opacity-90 transition"
        >
          Argandhi.
        </Link>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto">
        <div className="rounded-[32px] bg-[#121212] border border-white/[0.08] p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
          {/* Card Header */}
          <div className="mb-7 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9E1B32] to-[#7D1426] text-white shadow-lg shadow-[#9E1B32]/25">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Login Admin
            </h1>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>

      <div aria-hidden="true" className="pt-6" />
    </div>
  );
}
