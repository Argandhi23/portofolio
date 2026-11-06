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
          prev.map((b) =>
            b.id === brand.id ? { ...b, is_active: nextActive } : b
          )
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Tech Stack
          </h1>
          <span className="rounded-full bg-[#181818] border border-white/[0.08] px-2.5 py-0.5 text-xs font-bold text-[#9E1B32]">
            {brands.length}
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Tech Stack</span>
        </button>
      </div>

      {/* Brands Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/[0.07] bg-[#161616] text-[10.5px] uppercase tracking-wider text-white/55 font-semibold">
            <tr>
              <th scope="col" className="py-3.5 pl-5 pr-3">
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
              <th scope="col" className="py-3.5 pl-3 pr-5 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-white/80">
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3.5 pl-5 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#181818] p-1 flex items-center justify-center">
                      {brand.logo_url ? (
                        <Image
                          src={brand.logo_url}
                          alt={brand.name}
                          fill
                          className="object-contain p-1"
                          sizes="40px"
                          unoptimized={
                            brand.logo_url.startsWith('data:') ||
                            brand.logo_url.endsWith('.svg')
                          }
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-white/40 uppercase">
                          {brand.name.substring(0, 3)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-white">
                      {brand.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-white/60">
                  {brand.website_url ? (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/60 hover:text-[#9E1B32] transition-colors"
                    >
                      <span className="truncate max-w-[200px]">
                        {brand.website_url}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-white/30">-</span>
                  )}
                </td>
                <td className="px-3 py-3.5 text-center font-mono text-white/60">
                  {brand.display_order}
                </td>
                <td className="px-3 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(brand)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                      brand.is_active
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/[0.08] bg-[#181818] text-white/50 hover:text-white'
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
                <td className="py-3.5 pl-3 pr-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 rounded-lg border border-white/[0.08] bg-[#181818] text-white/60 hover:text-white hover:border-white/20 transition cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="p-1.5 rounded-lg border border-white/[0.08] bg-[#181818] text-white/45 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#121212] p-6">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3.5 mb-4">
              <div className="flex items-center gap-2 text-white">
                <Code2 className="h-4 w-4 text-[#9E1B32]" />
                <h3 className="text-sm font-bold">
                  {editingBrand ? 'Edit Tech Stack' : 'Tambah Tech Stack'}
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
                  Nama <span className="text-[#9E1B32]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Next.js"
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2 text-sm text-white focus:border-[#9E1B32] focus:outline-none"
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
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  URL (Opsional)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://nextjs.org"
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
