import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin, UnauthorizedError } from '@/lib/auth-guard';
import { ResetPasswordForm } from '@/components/admin/ResetPasswordForm';

export const metadata: Metadata = { title: 'Reset Password — Argandhi.', robots: { index: false, follow: false } };

export default async function ResetPasswordPage() {
  try { await requireAdmin(); } catch (error) {
    if (error instanceof UnauthorizedError) redirect('/login?recovery=invalid');
    throw error;
  }
  return (
    <main className="min-h-screen grid place-items-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Atur kata sandi baru</h1>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
