'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandActive,
} from '@/actions/brand.actions';
import { ImageUploader } from '@/components/admin/ImageUploader';
import type { Brand } from '@/types/database.types';
import type { BrandInput } from '@/lib/validations/brand.schema';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Code2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
} from 'lucide-react';

interface BrandsManagerProps {
  initialBrands: Brand[];
}

export function BrandsManager({ initialBrands }: BrandsManagerProps) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form modal state
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Modal input fields
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setLogoUrl('');
    setWebsiteUrl('');
    setDisplayOrder(brands.length + 1);
    setIsActive(true);
    setError(null);
    setIsOpenModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setLogoUrl(brand.logo_url || '');
    setWebsiteUrl(brand.website_url || '');
    setDisplayOrder(brand.display_order);
    setIsActive(brand.is_active);
    setError(null);
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setEditingBrand(null);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: BrandInput = {
      name,
      logo_url: logoUrl || null,
      website_url: websiteUrl || null,
      display_order: displayOrder,
      is_active: isActive,
    };

    startTransition(async () => {
      if (editingBrand) {
        const res = await updateBrand(editingBrand.id, payload);
        if (!res.success) {
          setError(res.message);
        } else if (res.data) {
          setBrands((prev) =>
            prev.map((b) => (b.id === editingBrand.id ? res.data! : b))
          );
          closeModal();
        }
      } else {
        const res = await createBrand(payload);
        if (!res.success) {
          setError(res.message);
        } else if (res.data) {
          setBrands((prev) =>
            [...prev, res.data!].sort((a, b) => a.display_order - b.display_order)
          );
          closeModal();
        }
      }
    });
  };

  const handleToggle = (brand: Brand) => {
    startTransition(async () => {
      const nextActive = !brand.is_active;
      const res = await toggleBrandActive(brand.id, nextActive);
      if (res.success) {
        setBrands((prev) =>
          prev.map((b) => (b.id === brand.id ? { ...b, is_active: nextActive } : b))
        );
      }
    });
  };

  const handleDelete = (id: string, brandName: string) => {
    if (!window.confirm(`Hapus "${brandName}"?`)) return;

    startTransition(async () => {
      const res = await deleteBrand(id);
      if (res.success) {
        setBrands((prev) => prev.filter((b) => b.id !== id));
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tech Stack
          </h1>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
            {brands.length}
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF5510] hover:bg-[#FF6B2B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#FF5510]/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Brands Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl backdrop-blur-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-900 bg-zinc-900/40 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3">
                Teknologi
              </th>
              <th scope="col" className="px-3 py-3.5">
                URL
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
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-zinc-900/30 transition">
                <td className="py-3.5 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/80 p-1 flex items-center justify-center">
                      {brand.logo_url ? (
                        <Image
                          src={brand.logo_url}
                          alt={brand.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                          unoptimized={
                            brand.logo_url.startsWith('data:') ||
                            brand.logo_url.endsWith('.svg')
                          }
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">
                          {brand.name.substring(0, 3)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-white">{brand.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-zinc-400">
                  {brand.website_url ? (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-orange-400 transition"
                    >
                      <span className="truncate max-w-[200px]">{brand.website_url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-zinc-600">-</span>
                  )}
                </td>
                <td className="px-3 py-3.5 text-center font-mono text-zinc-400">
                  {brand.display_order}
                </td>
                <td className="px-3 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(brand)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                      brand.is_active
                        ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {brand.is_active ? (
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
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Brand */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
              <div className="flex items-center gap-2 text-white">
                <Code2 className="h-5 w-5 text-orange-400" />
                <h3 className="text-base font-semibold">
                  {editingBrand ? 'Edit Tech Stack' : 'Tambah Tech Stack'}
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
                  Nama <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Next.js"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <ImageUploader
                  label="Logo (SVG / PNG)"
                  value={logoUrl}
                  onChange={(url) => setLogoUrl(url)}
                  folder="brands/logos"
                  aspectRatio="square"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  URL (Opsional)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://nextjs.org"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
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
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Status
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
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
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-500 transition disabled:opacity-50"
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
