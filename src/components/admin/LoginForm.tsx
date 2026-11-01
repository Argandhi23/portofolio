'use client';

import { useActionState, useState, useTransition } from 'react';
import { loginAdmin, sendAdminPasswordReset } from '@/actions/auth.actions';
import type { ActionResult } from '@/types/action.types';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const initialState: ActionResult = {
  success: false,
  message: '',
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('argandhi23@gmail.com');
  const [resetMessage, setResetMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isResetPending, startResetTransition] = useTransition();

  const handleResetPassword = () => {
    setResetMessage(null);
    startResetTransition(async () => {
      const res = await sendAdminPasswordReset(emailInput);
      setResetMessage({
        text: res.message,
        isError: !res.success,
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Error Banner */}
      {state?.message && !state?.success && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 backdrop-blur-md"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="leading-relaxed">{state.message}</p>
        </div>
      )}

      {/* Password Reset Feedback Banner */}
      {resetMessage && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs backdrop-blur-md border ${
            resetMessage.isError
              ? 'border-red-500/30 bg-red-950/40 text-red-300'
              : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
          }`}
        >
          {resetMessage.isError ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <p className="leading-relaxed">{resetMessage.text}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5" noValidate>
        {/* Email Input Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="email"
              className="block text-[11.5px] font-semibold uppercase tracking-wider text-white/80"
            >
              Email Administrator
            </label>
            <span className="text-[11px] font-mono text-[#FF5510]">
              *Terdaftar
            </span>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="argandhi23@gmail.com"
              className="w-full rounded-2xl border border-white/[0.08] bg-[#181818] py-3 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder:text-white/30 transition duration-200 focus:border-[#FF5510] focus:outline-none focus:ring-1 focus:ring-[#FF5510] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {state?.fieldErrors?.email && (
            <p className="text-xs text-red-400 mt-1">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password Input Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[11.5px] font-semibold uppercase tracking-wider text-white/80"
            >
              Kata Sandi (Password)
            </label>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isPending || isResetPending}
              className="text-[11px] font-medium text-[#FF5510] hover:text-[#FF6B2B] hover:underline focus:outline-none disabled:opacity-50 transition"
            >
              {isResetPending ? 'Mengirim email reset...' : 'Lupa kata sandi?'}
            </button>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isPending}
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-white/[0.08] bg-[#181818] py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-white/30 transition duration-200 focus:border-[#FF5510] focus:outline-none focus:ring-1 focus:ring-[#FF5510] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              disabled={isPending}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {state?.fieldErrors?.password && (
            <p className="text-xs text-red-400 mt-1">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="pill-btn w-full flex items-center justify-center gap-3 bg-[#FF5510] hover:bg-[#FF6B2B] text-white py-3 px-6 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-[#FF5510]/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5510]/50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Memverifikasi akun...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Panel Admin</span>
              <span className="arrow-circle w-6 h-6 rounded-full bg-white text-[#FF5510] flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </>
          )}
        </button>
      </form>

      {/* Helper Card for Forgot Password & Credentials Info */}
      <div className="rounded-2xl bg-[#141414] border border-white/[0.06] p-4 text-[11.5px] text-white/70 space-y-2">
        <div className="flex items-center gap-2 text-white/90 font-semibold">
          <KeyRound className="h-3.5 w-3.5 text-[#FF5510]" />
          <span>Informasi Kredensial Administrator</span>
        </div>
        <p className="text-white/60 leading-relaxed">
          Akun admin menggunakan email <strong className="text-white font-mono">argandhi23@gmail.com</strong> yang terdaftar di Supabase Auth.
        </p>
        <p className="text-white/60 leading-relaxed">
          Jika lupa kata sandi, klik tombol <span className="text-[#FF5510] font-semibold">&quot;Lupa kata sandi?&quot;</span> di atas untuk menerima email pemulihan langsung, atau atur ulang di Supabase Dashboard (Auth &gt; Users &gt; Reset Password).
        </p>
      </div>
    </div>
  );
}
