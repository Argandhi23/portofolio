'use client';

import { useActionState } from 'react';
import { resetAdminPassword } from '@/actions/auth.actions';
import type { ActionResult } from '@/types/action.types';

const initialState: ActionResult = { success: false, message: '' };
export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetAdminPassword, initialState);
  return (
    <form action={action} className="space-y-5">
      {state.message && <p role="alert" className="text-sm text-rose-300">{state.message}</p>}
      {[
        { name: 'password', label: 'Kata sandi baru' },
        { name: 'confirmPassword', label: 'Konfirmasi kata sandi' },
      ].map(({ name, label }) => (
        <div key={name} className="space-y-2">
          <label htmlFor={name} className="block text-sm">{label}</label>
          <input id={name} name={name} type="password" autoComplete="new-password" required minLength={8} maxLength={128}
            disabled={pending} aria-invalid={!!state.fieldErrors?.[name]} aria-describedby={state.fieldErrors?.[name] ? `${name}-error` : undefined}
            className="w-full rounded-xl border border-white/20 bg-[#121212] px-4 py-3 focus-visible:outline-2 focus-visible:outline-[#E04D70]" />
          {state.fieldErrors?.[name] && <p id={`${name}-error`} className="text-sm text-rose-300">{state.fieldErrors[name][0]}</p>}
        </div>
      ))}
      <button type="submit" disabled={pending} className="rounded-full bg-[#9E1B32] px-6 py-3 text-sm font-semibold disabled:opacity-50">
        {pending ? 'Menyimpan...' : 'Simpan kata sandi'}
      </button>
    </form>
  );
}
