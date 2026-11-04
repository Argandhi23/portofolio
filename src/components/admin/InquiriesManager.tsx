'use client';

import { useState, useTransition } from 'react';
import {
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  Reply,
  Trash2,
} from 'lucide-react';
import {
  deleteInquiry,
  updateInquiryStatus,
} from '@/actions/inquiry.actions';
import type { Inquiry, InquiryStatus } from '@/types/database.types';

interface InquiriesManagerProps {
  initialInquiries: Inquiry[];
}

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered =
    filter === 'all'
      ? initialInquiries
      : initialInquiries.filter((item) => item.status === filter);

  const unreadCount = initialInquiries.filter((i) => i.status === 'unread').length;

  const handleStatusChange = (id: string, nextStatus: InquiryStatus) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateInquiryStatus(id, nextStatus);
      if (!res.success) {
        setFeedback(res.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteInquiry(id);
      setConfirmDeleteId(null);
      if (!res.success) {
        setFeedback(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'all', label: `Semua (${initialInquiries.length})` },
              { key: 'unread', label: `Belum Dibaca (${unreadCount})` },
              {
                key: 'read',
                label: `Dibaca (${initialInquiries.filter((i) => i.status === 'read').length})`,
              },
              {
                key: 'replied',
                label: `Dibalas (${initialInquiries.filter((i) => i.status === 'replied').length})`,
              },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-[#9E1B32] text-white shadow-lg shadow-[#9E1B32]/20'
                    : 'bg-[#121212] text-white/65 border border-white/[0.08] hover:text-white hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {feedback}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-white/[0.07] bg-[#121212] p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#181818] border border-white/[0.08] text-[#9E1B32]">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">
            Belum ada pesan
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isUnread = item.status === 'unread';
            const isReplied = item.status === 'replied';
            const formattedDate = new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(item.created_at));

            const replySubject = encodeURIComponent(
              item.subject
                ? `Re: ${item.subject} — Argandhi.`
                : `Re: Diskusi Proyek Software — Argandhi.`
            );
            const replyBody = encodeURIComponent(
              `Halo ${item.name},\n\nTerima kasih sudah menghubungi saya melalui portofolio Argandhi.\nMenanggapi brief proyek Anda:\n"${item.message}"\n\n`
            );

            return (
              <div
                key={item.id}
                className={`rounded-[26px] border p-6 transition-colors space-y-4 ${
                  isUnread
                    ? 'bg-[#151312] border-[#9E1B32]/40 shadow-lg shadow-[#9E1B32]/5'
                    : 'bg-[#121212] border-white/[0.07]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {isUnread && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9E1B32]/15 border border-[#9E1B32]/35 px-2.5 py-0.5 text-[10.5px] font-bold text-[#9E1B32]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#9E1B32] animate-pulse" />
                          Baru
                        </span>
                      )}
                      {item.status === 'read' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-white/70">
                          <Clock className="h-3 w-3" />
                          Dibaca
                        </span>
                      )}
                      {isReplied && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Sudah Dibalas
                        </span>
                      )}
                      <h3 className="text-base font-bold text-white">
                        {item.name}
                      </h3>
                      <span className="text-xs text-white/45">&bull;</span>
                      <a
                        href={`mailto:${item.email}`}
                        className="text-xs font-medium text-[#9E1B32] hover:underline"
                      >
                        {item.email}
                      </a>
                    </div>

                    {item.subject && (
                      <p className="text-xs font-semibold text-white/85">
                        Subjek: {item.subject}
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-white/45 shrink-0">
                    {formattedDate}
                  </span>
                </div>

                <div className="rounded-2xl bg-[#181818] border border-white/[0.06] p-4 text-xs sm:text-[13.5px] text-white/85 leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${item.email}?subject=${replySubject}&body=${replyBody}`}
                      onClick={() => {
                        if (item.status !== 'replied') {
                          handleStatusChange(item.id, 'replied');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-4 py-1.5 text-xs font-semibold text-white transition"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>Balas via Email</span>
                    </a>

                    {isUnread ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(item.id, 'read')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] hover:bg-white/10 border border-white/[0.08] px-3.5 py-1.5 text-xs font-medium text-white/80 transition cursor-pointer disabled:opacity-50"
                      >
                        <Mail className="h-3.5 w-3.5 text-white/60" />
                        <span>Tandai Dibaca</span>
                      </button>
                    ) : !isReplied ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(item.id, 'replied')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] hover:bg-white/10 border border-white/[0.08] px-3.5 py-1.5 text-xs font-medium text-white/80 transition cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Tandai Sudah Dibalas</span>
                      </button>
                    ) : null}
                  </div>

                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(item.id)}
                        className="rounded-full bg-red-600 hover:bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-full bg-[#181818] border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:text-white transition cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] hover:bg-red-500/15 border border-white/[0.07] hover:border-red-500/30 px-3 py-1.5 text-xs text-white/55 hover:text-red-300 transition cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
