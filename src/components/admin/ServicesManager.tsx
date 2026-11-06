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
          prev.map((s) =>
            s.id === service.id ? { ...s, is_active: nextActive } : s
          )
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Layanan
          </h1>
          <span className="rounded-full bg-[#181818] border border-white/[0.08] px-2.5 py-0.5 text-xs font-bold text-[#9E1B32]">
            {services.length}
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Layanan</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/[0.07] bg-[#161616] text-[10.5px] uppercase tracking-wider text-white/55 font-semibold">
            <tr>
              <th scope="col" className="py-3.5 pl-5 pr-3">
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
              <th scope="col" className="py-3.5 pl-3 pr-5 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-white/80">
            {services.map((service) => {
              const decoded = decodeLocalized(service.title);
              return (
                <tr
                  key={service.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 pl-5 pr-3 font-mono font-bold text-[#9E1B32]">
                    {service.number_label}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="font-semibold text-white">
                      {decoded.en}
                    </span>
                    {decoded.id && decoded.id !== decoded.en && (
                      <span className="ml-2 text-white/45">/ {decoded.id}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-white/60">
                    {service.display_order}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(service)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                        service.is_active
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/[0.08] bg-[#181818] text-white/50 hover:text-white'
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
                  <td className="py-3.5 pl-3 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="p-1.5 rounded-lg border border-white/[0.08] bg-[#181818] text-white/60 hover:text-white hover:border-white/20 transition cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id, decoded.en)}
                        className="p-1.5 rounded-lg border border-white/[0.08] bg-[#181818] text-white/45 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#121212] p-6">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3.5 mb-4">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-[#9E1B32]" />
                <h3 className="text-sm font-bold">
                  {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-white/45 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={numberLabel}
                  onChange={(e) => setNumberLabel(e.target.value)}
                  placeholder="#01"
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2 text-sm text-white font-mono focus:border-[#9E1B32] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
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
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2 text-sm text-white focus:border-[#9E1B32] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) =>
                      setDisplayOrder(parseInt(e.target.value, 10) || 0)
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2 text-sm text-white focus:border-[#9E1B32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    Status
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2 text-sm text-white focus:border-[#9E1B32] focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-full border border-white/10 bg-[#181818] px-4 py-1.5 text-xs font-medium text-white/75 hover:text-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#9E1B32] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#B8233E] transition disabled:opacity-50 cursor-pointer"
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
