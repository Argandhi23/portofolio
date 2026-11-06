'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  Globe,
  Laptop,
  Loader2,
  MapPin,
  Smartphone,
  Tablet,
  Trash2,
  Users,
} from 'lucide-react';
import { clearVisitorLogs } from '@/actions/analytics.actions';
import type { VisitorAnalyticsSummary } from '@/lib/visitor-utils';
import type { PageView } from '@/types/database.types';

interface VisitorAnalyticsPanelProps {
  summary: VisitorAnalyticsSummary;
  recentViews: PageView[];
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatExactTime(isoDate: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

function shortVisitorTag(visitorId: string): string {
  const clean = visitorId.replace(/^v_/, '').replace(/[^a-zA-Z0-9]/g, '');
  return `#${clean.slice(0, 5).toLowerCase() || 'anon'}`;
}

function formatLocation(city: string | null, country: string | null): string {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return 'Tidak diketahui';
}

export function VisitorAnalyticsPanel({
  summary,
  recentViews,
}: VisitorAnalyticsPanelProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const periodCards: Array<{
    key: PeriodFilter;
    label: string;
    views: number;
    unique: number;
  }> = [
    {
      key: 'today',
      label: 'Hari Ini',
      views: summary.today.views,
      unique: summary.today.unique,
    },
    {
      key: 'week',
      label: 'Minggu Ini',
      views: summary.thisWeek.views,
      unique: summary.thisWeek.unique,
    },
    {
      key: 'month',
      label: 'Bulan Ini',
      views: summary.thisMonth.views,
      unique: summary.thisMonth.unique,
    },
    {
      key: 'year',
      label: 'Tahun Ini',
      views: summary.thisYear.views,
      unique: summary.thisYear.unique,
    },
    {
      key: 'all',
      label: 'Semua Waktu',
      views: summary.allTime.views,
      unique: summary.allTime.unique,
    },
  ];

  const filteredViews = useMemo(() => {
    if (periodFilter === 'all') return recentViews;
    const now = new Date();
    let cutoff = 0;

    if (periodFilter === 'today') {
      cutoff = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
    } else if (periodFilter === 'week') {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      cutoff = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diff
      ).getTime();
    } else if (periodFilter === 'month') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    } else if (periodFilter === 'year') {
      cutoff = new Date(now.getFullYear(), 0, 1).getTime();
    }

    return recentViews.filter(
      (item) => new Date(item.created_at).getTime() >= cutoff
    );
  }, [recentViews, periodFilter]);

  const handleClearLogs = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await clearVisitorLogs();
      setConfirmClear(false);
      if (!res.success) {
        setFeedback(res.message);
      }
    });
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#9E1B32]" />
          <h2 className="text-sm font-bold tracking-tight text-white">
            Statistik Kunjungan Website
          </h2>
        </div>

        <span className="text-[11px] text-white/45">
          Klik kartu periode untuk memfilter daftar pengunjung
        </span>
      </div>

      {/* 5 Period Summary Cards (Today, Week, Month, Year, All-Time) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {periodCards.map((card) => {
          const isSelected = periodFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setPeriodFilter(card.key)}
              className={`text-left rounded-2xl border p-4 transition-colors cursor-pointer ${
                isSelected
                  ? 'border-[#9E1B32]/60 bg-[#161213]'
                  : 'border-white/[0.07] bg-[#121212] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between text-white/55">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {card.label}
                </span>
                <Calendar
                  className={`h-3.5 w-3.5 ${
                    isSelected ? 'text-[#9E1B32]' : 'text-white/30'
                  }`}
                />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {card.views}
                </span>
                <span className="text-[11px] text-white/45">klik</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/50">
                <Users className="h-3 w-3 text-[#9E1B32]" />
                <span>{card.unique} pengunjung unik</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Top Sources & Top Pages Compact Strip */}
      {(summary.topSources.length > 0 || summary.topPages.length > 0) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Top Traffic Sources */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-4 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Sumber Kunjungan (Dari Mana)
            </span>
            <div className="flex flex-wrap gap-2">
              {summary.topSources.map((item) => (
                <div
                  key={item.source}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#181818] border border-white/[0.07] px-3 py-1.5 text-xs"
                >
                  <Globe className="h-3 w-3 text-[#9E1B32]" />
                  <span className="font-semibold text-white">{item.source}</span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-white/70">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clicked Pages */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-4 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
              Halaman Paling Sering Diklik
            </span>
            <div className="flex flex-wrap gap-2">
              {summary.topPages.map((item) => (
                <div
                  key={item.path}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#181818] border border-white/[0.07] px-3 py-1.5 text-xs"
                >
                  <span className="font-mono font-semibold text-white">
                    {item.path}
                  </span>
                  <span className="rounded-full bg-[#9E1B32]/20 border border-[#9E1B32]/30 px-2 py-0.5 font-mono text-[10px] text-white/90">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
          {feedback}
        </div>
      )}

      {/* Visitor Log Table ("Siapa yang Mengunjungi") */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121212] overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
              Riwayat Pengunjung Terbaru
            </h3>
            <span className="rounded-full bg-[#181818] border border-white/[0.07] px-2.5 py-0.5 text-[11px] font-mono text-[#9E1B32] font-bold">
              {filteredViews.length}
            </span>
          </div>

          {recentViews.length > 0 && (
            <div className="flex items-center gap-2">
              {confirmClear ? (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleClearLogs}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-500 px-3.5 py-1.5 text-[11px] font-bold text-white transition cursor-pointer disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span>Ya, Hapus Semua</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setConfirmClear(false)}
                    className="rounded-full bg-[#181818] border border-white/10 px-3 py-1.5 text-[11px] text-white/70 hover:text-white transition cursor-pointer"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] hover:bg-red-500/15 border border-white/[0.07] hover:border-red-500/30 px-3.5 py-1.5 text-[11px] font-medium text-white/60 hover:text-red-300 transition cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Bersihkan Riwayat</span>
                </button>
              )}
            </div>
          )}
        </div>

        {filteredViews.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-xs font-semibold text-white/75">
              Belum ada data kunjungan pada periode ini
            </p>
            <p className="text-[11px] text-white/40">
              Setiap kali pengunjung publik membuka halaman website, detailnya akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-white/[0.07] bg-[#161616] text-[10.5px] uppercase tracking-wider text-white/55 font-semibold">
                <tr>
                  <th scope="col" className="py-3 pl-5 pr-3">
                    Pengunjung & Lokasi
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Dari Mana
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Halaman Diklik
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Perangkat
                  </th>
                  <th scope="col" className="py-3 pl-3 pr-5 text-right">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-white/80">
                {filteredViews.slice(0, 60).map((view) => {
                  const DeviceIcon =
                    view.device_type === 'Mobile'
                      ? Smartphone
                      : view.device_type === 'Tablet'
                        ? Tablet
                        : Laptop;

                  return (
                    <tr
                      key={view.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Visitor ID, Status & Location */}
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-white">
                            {shortVisitorTag(view.visitor_id)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                              view.is_returning
                                ? 'bg-white/[0.05] text-white/65 border-white/10'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            }`}
                          >
                            {view.is_returning ? 'Berulang' : 'Baru'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-white/50">
                          <MapPin className="h-3 w-3 text-[#9E1B32] shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {formatLocation(view.city, view.country)}
                          </span>
                        </div>
                      </td>

                      {/* Traffic Source */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#181818] border border-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-white/85">
                          <Globe className="h-3 w-3 text-[#9E1B32]" />
                          {view.referrer_source || 'Direct'}
                        </span>
                      </td>

                      {/* Clicked Page */}
                      <td className="px-3 py-3">
                        <span className="font-mono text-[11.5px] text-white/90">
                          {view.path}
                        </span>
                      </td>

                      {/* Device, Browser & OS */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-[11.5px] text-white/75">
                          <DeviceIcon className="h-3.5 w-3.5 text-white/45 shrink-0" />
                          <span>
                            {view.browser} &middot; {view.os}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 text-[11.5px] font-medium text-white/85">
                          <Clock className="h-3 w-3 text-white/40" />
                          <span>{formatRelativeTime(view.created_at)}</span>
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          {formatExactTime(view.created_at)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
