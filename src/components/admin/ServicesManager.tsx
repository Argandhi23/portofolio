'use client';

import { useState, useTransition } from 'react';
import {
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
} from '@/actions/service.actions';
import { AdminLangTabs } from '@/components/admin/AdminLangTabs';
import {
  decodeLocalized,
  encodeLocalized,
  type Locale,
  type LocalizedPair,
} from '@/lib/i18n/localized';
import type { Service } from '@/types/database.types';
import type { ServiceInput } from '@/lib/validations/service.schema';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
} from 'lucide-react';

interface ServicesManagerProps {
  initialServices: Service[];
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form modal state
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeLang, setActiveLang] = useState<Locale>('en');

  // Modal input fields
  const [numberLabel, setNumberLabel] = useState('#01');
  const [titlePair, setTitlePair] = useState<LocalizedPair>({ en: '', id: '' });
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingService(null);
    setNumberLabel(`#0${services.length + 1}`);
    setTitlePair({ en: '', id: '' });
    setActiveLang('en');
    setDisplayOrder(services.length + 1);
    setIsActive(true);
    setError(null);
    setIsOpenModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setNumberLabel(service.number_label);
    setTitlePair(decodeLocalized(service.title));
    setActiveLang('en');
    setDisplayOrder(service.display_order);
    setIsActive(service.is_active);
    setError(null);
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setEditingService(null);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const encodedTitle = encodeLocalized(titlePair);
    if (!encodedTitle) {
      setError('Judul layanan wajib diisi.');
      return;
    }

    const payload: ServiceInput = {
      number_label: numberLabel,
      title: encodedTitle,
      display_order: displayOrder,
      is_active: isActive,
    };

    startTransition(async () => {
      if (editingService) {
        const res = await updateService(editingService.id, payload);
        if (!res.success) {
          setError(res.message);
        } else if (res.data) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? res.data! : s))
          );
          closeModal();
        }
      } else {
        const res = await createService(payload);
        if (!res.success) {
          setError(res.message);
        } else if (res.data) {
          setServices((prev) =>
            [...prev, res.data!].sort((a, b) => a.display_order - b.display_order)
          );
          closeModal();
        }
      }
    });
  };

  const handleToggle = (service: Service) => {
    startTransition(async () => {
      const nextActive = !service.is_active;
      const res = await toggleServiceActive(service.id, nextActive);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, is_active: nextActive } : s))
        );
      }
    });
  };

  const handleDelete = (id: string, label: string) => {
    if (!window.confirm(`Hapus layanan "${label}"?`)) return;

    startTransition(async () => {
      const res = await deleteService(id);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Layanan
          </h1>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
            {services.length}
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#9E1B32]/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl backdrop-blur-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-900 bg-zinc-900/40 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3">
                Label
              </th>
              <th scope="col" className="px-3 py-3.5">
                Nama Layanan
              </th>
              <th scope="col" className="px-3 py-3.5 text-center">
                Urutan
              </th>
              <th scope="col" className="px-3 py-3.5 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/80 text-zinc-300">
            {services.map((service) => {
              const decoded = decodeLocalized(service.title);
              return (
                <tr key={service.id} className="hover:bg-zinc-900/30 transition">
                  <td className="py-3.5 pl-6 pr-3 font-mono font-semibold text-[#C7254E]">
                    {service.number_label}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="font-medium text-white">{decoded.en}</span>
                    {decoded.id && decoded.id !== decoded.en && (
                      <span className="ml-2 text-zinc-400">/ {decoded.id}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-zinc-400">
                    {service.display_order}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(service)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                        service.is_active
                          ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {service.is_active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id, decoded.en)}
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Service */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-[#C7254E]" />
                <h3 className="text-base font-semibold">
                  {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={numberLabel}
                  onChange={(e) => setNumberLabel(e.target.value)}
                  placeholder="#01"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 font-mono focus:border-[#9E1B32] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Nama Layanan ({activeLang.toUpperCase()})
                  </label>
                  <AdminLangTabs value={activeLang} onChange={setActiveLang} />
                </div>
                <input
                  type="text"
                  value={titlePair[activeLang]}
                  onChange={(e) =>
                    setTitlePair((prev) => ({
                      ...prev,
                      [activeLang]: e.target.value,
                    }))
                  }
                  placeholder={
                    activeLang === 'en' ? 'Web Development' : 'Pengembangan Web'
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-[#9E1B32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) =>
                      setDisplayOrder(parseInt(e.target.value, 10) || 0)
                    }
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-[#9E1B32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Status
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-[#9E1B32] focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#9E1B32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#B8233E] transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
