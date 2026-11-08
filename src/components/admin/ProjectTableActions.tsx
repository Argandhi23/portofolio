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
        if (res.warning) window.alert(res.warning);
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
          title={
            isFeatured ? 'Hapus dari Featured' : 'Jadikan Featured (Showcase)'
          }
          className={`p-1.5 rounded-lg border transition cursor-pointer ${
            isFeatured
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'border-white/[0.08] bg-[#181818] text-white/45 hover:text-amber-400'
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
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
            status === 'published'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'border-white/[0.08] bg-[#181818] text-white/55 hover:text-white'
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
          className="p-1.5 rounded-lg border border-white/[0.08] bg-[#181818] text-white/60 hover:text-white hover:border-white/20 transition"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>

        {/* Delete Trigger */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending}
          title="Hapus Project"
          className="p-1.5 rounded-lg border border-white/[0.08] bg-[#181818] text-white/45 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#121212] p-6">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Hapus Project</h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed text-left">
              Hapus project{' '}
              <strong className="text-white">&quot;{title}&quot;</strong> secara
              permanen?
            </p>

            {error && (
              <p className="mt-3 text-xs text-red-300 bg-red-500/10 p-2.5 rounded-xl text-left">
                {error}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="rounded-full border border-white/10 bg-[#181818] px-4 py-1.5 text-xs font-medium text-white/75 hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
