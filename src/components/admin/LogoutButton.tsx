'use client';

import { useTransition } from 'react';
import { logoutAdmin } from '@/actions/auth.actions';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Keluar dari Panel Admin"
      className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-white/60 hover:bg-red-950/30 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-50 cursor-pointer"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-red-400" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{isPending ? 'Keluar...' : 'Keluar'}</span>
    </button>
  );
}
