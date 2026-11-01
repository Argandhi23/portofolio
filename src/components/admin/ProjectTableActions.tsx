'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  toggleProjectStatus,
  toggleProjectFeatured,
  deleteProject,
} from '@/actions/project.actions';
import {
  Pencil,
  Trash2,
  Star,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ProjectTableActionsProps {
  id: string;
  title: string;
  status: 'draft' | 'published';
  isFeatured: boolean;
}

export function ProjectTableActions({
  id,
  title,
  status,
  isFeatured,
}: ProjectTableActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = () => {
    const nextStatus = status === 'published' ? 'draft' : 'published';
    startTransition(async () => {
      const res = await toggleProjectStatus(id, nextStatus);
      if (!res.success) {
        setError(res.message);
      }
    });
  };

  const handleToggleFeatured = () => {
    startTransition(async () => {
      const res = await toggleProjectFeatured(id, !isFeatured);
      if (!res.success) {
        setError(res.message);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProject(id);
      if (!res.success) {
        setError(res.message);
      } else {
        setShowDeleteModal(false);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {/* Toggle Featured */}
        <button
          type="button"
          onClick={handleToggleFeatured}
          disabled={isPending}
          title={isFeatured ? 'Hapus dari Featured' : 'Jadikan Featured (Showcase)'}
          className={`p-1.5 rounded-lg border transition ${
            isFeatured
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800'
          }`}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Star
              className={`h-3.5 w-3.5 ${isFeatured ? 'fill-amber-400' : ''}`}
            />
          )}
        </button>

        {/* Quick Toggle Status */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isPending}
          title={status === 'published' ? 'Ubah ke Draft' : 'Publikasikan'}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
            status === 'published'
              ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
              : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          {status === 'published' ? (
            <>
              <Eye className="h-3 w-3" />
              <span>Published</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" />
              <span>Draft</span>
            </>
          )}
        </button>

        {/* Edit Button */}
        <Link
          href={`/admin/projects/${id}/edit`}
          title="Sunting Project"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>

        {/* Delete Trigger */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending}
          title="Hapus Project"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/20 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-950/50 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Konfirmasi Hapus Project
                </h3>
                <p className="text-xs text-zinc-400">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus project{' '}
              <strong className="text-white">&quot;{title}&quot;</strong>? Semua file
              thumbnail dan galeri di Supabase Storage juga akan otomatis dibersihkan.
            </p>

            {error && (
              <p className="mt-3 text-xs text-red-400 bg-red-950/40 p-2 rounded-md">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Project</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
