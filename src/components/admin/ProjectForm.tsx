'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProject, updateProject } from '@/actions/project.actions';
import { AdminLangTabs } from '@/components/admin/AdminLangTabs';
import { ImageUploader } from '@/components/admin/ImageUploader';
import {
  decodeLocalized,
  encodeLocalized,
  type Locale,
  type LocalizedPair,
} from '@/lib/i18n/localized';
import { slugify } from '@/lib/utils';
import type { Project } from '@/types/database.types';
import type { ProjectInput } from '@/lib/validations/project.schema';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Globe,
  Smartphone,
  X,
  Code2,
} from 'lucide-react';
import { Github } from '@/components/ui/Icons';

interface ProjectFormProps {
  initialData?: Project;
  isEdit?: boolean;
}

const CATEGORY_SUGGESTIONS: Record<Locale, string[]> = {
  en: ['E-Commerce', 'Web App', 'Mobile App (APK)', 'AI Software', 'Landing Page'],
  id: ['E-Commerce', 'Aplikasi Web', 'Aplikasi Mobile (APK)', 'Sistem AI', 'Landing Page'],
};

const QUICK_TECH_STACK = [
  'Next.js',
  'TypeScript',
  'Supabase',
  'Tailwind CSS',
  'Flutter',
  'Firebase',
  'React',
  'PostgreSQL',
  'Vercel',
];

export function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [activeLang, setActiveLang] = useState<Locale>('en');

  // Bilingual form state
  const [titlePair, setTitlePair] = useState<LocalizedPair>(() =>
    decodeLocalized(initialData?.title)
  );
  const [categoryPair, setCategoryPair] = useState<LocalizedPair>(() =>
    decodeLocalized(initialData?.category)
  );
  const [summaryPair, setSummaryPair] = useState<LocalizedPair>(() =>
    decodeLocalized(initialData?.summary)
  );
  const [contentPair, setContentPair] = useState<LocalizedPair>(() =>
    decodeLocalized(initialData?.content)
  );

  // Shared metadata state
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugLocked, setIsSlugLocked] = useState(!isEdit);
  const [clientName, setClientName] = useState(initialData?.client_name || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnail_url || ''
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialData?.gallery_urls || []
  );
  const [techStack, setTechStack] = useState<string[]>(
    initialData?.tech_stack || []
  );
  const [customTechInput, setCustomTechInput] = useState('');
  const [projectUrl, setProjectUrl] = useState(initialData?.project_url || '');
  const [apkUrl, setApkUrl] = useState(initialData?.apk_url || '');
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || '');
  const [isFeatured, setIsFeatured] = useState(
    initialData?.is_featured || false
  );
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialData?.status || 'draft'
  );
  const [displayOrder, setDisplayOrder] = useState<number>(
    initialData?.display_order || 0
  );

  // Active tab for content preview
  const [contentTab, setContentTab] = useState<'write' | 'preview'>('write');

  // Tech stack handlers
  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    if (!techStack.includes(trimmed)) {
      setTechStack((prev) => [...prev, trimmed]);
    }
    setCustomTechInput('');
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack((prev) => prev.filter((t) => t !== tech));
  };

  // Auto-slug generator handler
  const handleTitleChange = (val: string) => {
    const nextPair = { ...titlePair, [activeLang]: val };
    setTitlePair(nextPair);
    if (isSlugLocked) {
      setSlug(slugify(nextPair.en || nextPair.id));
    }
  };

  // Gallery URL handlers
  const handleAddGalleryUrl = () => {
    setGalleryUrls((prev) => [...prev, '']);
  };

  const handleUpdateGalleryUrl = (index: number, url: string) => {
    setGalleryUrls((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const encodedSummary = encodeLocalized(summaryPair);
    const encodedContent = encodeLocalized(contentPair);

    const payload: ProjectInput = {
      title: encodeLocalized(titlePair),
      slug,
      category: encodeLocalized(categoryPair),
      client_name: clientName || null,
      summary: encodedSummary || null,
      content: encodedContent || null,
      thumbnail_url: thumbnailUrl,
      gallery_urls: galleryUrls.filter(Boolean),
      tech_stack: techStack,
      project_url: projectUrl || null,
      github_url: githubUrl || null,
      apk_url: apkUrl || null,
      is_featured: isFeatured,
      status,
      display_order: displayOrder,
    };

    startTransition(async () => {
      const res =
        isEdit && initialData?.id
          ? await updateProject(initialData.id, payload)
          : await createProject(payload);

      if (!res.success) {
        setError(res.message);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        router.push('/admin/projects');
      }
    });
  };

  const currentContent = contentPair[activeLang];

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isEdit ? 'Edit Project' : 'Tambah Project'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
          <Link
            href="/admin/projects"
            className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#9E1B32]/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Form Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (Main Details): 2 spans */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title & Slug Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Detail ({activeLang.toUpperCase()})
              </h2>
              <AdminLangTabs value={activeLang} onChange={setActiveLang} />
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Judul ({activeLang.toUpperCase()}){' '}
                <span className="text-[#9E1B32]">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={titlePair[activeLang]}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Al Parfume"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#9E1B32] focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.title[0]}
                </p>
              )}
            </div>

            {/* Slug input with auto/manual lock */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="slug"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Slug URL <span className="text-[#9E1B32]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSlugLocked((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                >
                  {isSlugLocked ? (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Otomatis</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3 text-[#C7254E]" />
                      <span className="text-[#C7254E]">Manual</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-1.5 flex rounded-lg border border-zinc-800 bg-zinc-900/80 overflow-hidden focus-within:border-[#9E1B32] focus-within:ring-1 focus-within:ring-[#9E1B32]">
                <span className="inline-flex items-center px-3 text-xs text-zinc-500 bg-zinc-900 border-r border-zinc-800">
                  /projects/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  disabled={isSlugLocked}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="alparfume"
                  className="flex-1 bg-transparent px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:text-zinc-400 disabled:cursor-not-allowed"
                />
              </div>
              {fieldErrors.slug && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.slug[0]}</p>
              )}
            </div>

            {/* Category & Client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label
                  htmlFor="category"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Kategori ({activeLang.toUpperCase()}){' '}
                  <span className="text-[#9E1B32]">*</span>
                </label>
                <input
                  id="category"
                  type="text"
                  value={categoryPair[activeLang]}
                  onChange={(e) =>
                    setCategoryPair((prev) => ({
                      ...prev,
                      [activeLang]: e.target.value,
                    }))
                  }
                  placeholder="E-Commerce"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#9E1B32] focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                />
                {fieldErrors.category && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.category[0]}
                  </p>
                )}
                {/* Category Chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CATEGORY_SUGGESTIONS[activeLang].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setCategoryPair((prev) => ({
                          ...prev,
                          [activeLang]: cat,
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                        categoryPair[activeLang] === cat
                          ? 'border-[#9E1B32]/50 bg-[#9E1B32]/10 text-[#C7254E]'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="clientName"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Klien (Opsional)
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Al Parfume Official"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#9E1B32] focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="pt-2">
              <label
                htmlFor="summary"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Ringkasan ({activeLang.toUpperCase()})
              </label>
              <textarea
                id="summary"
                rows={2}
                value={summaryPair[activeLang]}
                onChange={(e) =>
                  setSummaryPair((prev) => ({
                    ...prev,
                    [activeLang]: e.target.value,
                  }))
                }
                placeholder={
                  activeLang === 'en'
                    ? '1-sentence project summary...'
                    : 'Ringkasan 1 kalimat...'
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#9E1B32] focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
              />
            </div>
          </div>

          {/* Tech Stack Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#C7254E]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Tech Stack
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {techStack.length}
              </span>
            </div>

            {/* Quick-add chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TECH_STACK.map((tech) => {
                const isSelected = techStack.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() =>
                      isSelected ? handleRemoveTech(tech) : handleAddTech(tech)
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#9E1B32]/50 bg-[#9E1B32]/20 text-[#E04D70] font-semibold shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span>{tech}</span>
                    {isSelected ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
              <input
                type="text"
                value={customTechInput}
                onChange={(e) => setCustomTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech(customTechInput);
                  }
                }}
                placeholder="Tambah teknologi..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-[#9E1B32] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTech(customTechInput)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Selected badges */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#9E1B32]/30 bg-[#9E1B32]/10 px-2.5 py-1 text-xs font-semibold text-[#E04D70]"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-[#C7254E] hover:text-red-400 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Markdown Content Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
              <label
                htmlFor="content"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Studi Kasus Markdown ({activeLang.toUpperCase()})
              </label>

              <div className="flex items-center gap-2">
                <AdminLangTabs value={activeLang} onChange={setActiveLang} />
                <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => setContentTab('write')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      contentTab === 'write'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Tulis
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab('preview')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      contentTab === 'preview'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {contentTab === 'write' ? (
              <textarea
                id="content"
                rows={12}
                value={currentContent}
                onChange={(e) =>
                  setContentPair((prev) => ({
                    ...prev,
                    [activeLang]: e.target.value,
                  }))
                }
                placeholder={
                  activeLang === 'en'
                    ? '## Project Goal\n\n...\n\n## Key Features\n\n- ...\n\n## Result\n\n...'
                    : '## Tujuan Proyek\n\n...\n\n## Fitur Utama\n\n- ...\n\n## Hasil\n\n...'
                }
                className="w-full font-mono rounded-lg border border-zinc-800 bg-zinc-900/80 p-3.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-[#9E1B32] focus:outline-none focus:ring-1 focus:ring-[#9E1B32] leading-relaxed"
              />
            ) : (
              <div className="min-h-[280px] rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-200 prose prose-invert max-w-none">
                {currentContent ? (
                  <div className="whitespace-pre-wrap">{currentContent}</div>
                ) : (
                  <p className="text-zinc-600 italic">Belum ada konten.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Settings): 1 span */}
        <div className="space-y-6">
          {/* Publishing Settings Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Publikasi
            </h2>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    status === 'draft'
                      ? 'border-zinc-500 bg-zinc-800 text-white'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    status === 'published'
                      ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Published
                </button>
              </div>
            </div>

            {/* Featured Showcase Switch */}
            <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
              <span className="block text-xs font-medium text-zinc-200">
                Featured
              </span>
              <button
                type="button"
                onClick={() => setIsFeatured((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFeatured ? 'bg-[#9E1B32]' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Display Order */}
            <div className="pt-2 border-t border-zinc-900">
              <label
                htmlFor="displayOrder"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Urutan
              </label>
              <input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) =>
                  setDisplayOrder(parseInt(e.target.value, 10) || 0)
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-[#9E1B32] focus:outline-none"
              />
            </div>

            {/* Tautan Proyek (Live, APK, GitHub) */}
            <div className="pt-3 border-t border-zinc-900 space-y-3">
              <div>
                <label
                  htmlFor="projectUrl"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Live URL
                </label>
                <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm focus-within:border-[#9E1B32] focus-within:ring-1 focus-within:ring-[#9E1B32]">
                  <Globe className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
                  <input
                    id="projectUrl"
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                {fieldErrors.project_url && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.project_url[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="apkUrl"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  APK URL
                </label>
                <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm focus-within:border-[#9E1B32] focus-within:ring-1 focus-within:ring-[#9E1B32]">
                  <Smartphone className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
                  <input
                    id="apkUrl"
                    type="url"
                    value={apkUrl}
                    onChange={(e) => setApkUrl(e.target.value)}
                    placeholder="https://.../app.apk"
                    className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                {fieldErrors.apk_url && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.apk_url[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="githubUrl"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  GitHub URL
                </label>
                <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm focus-within:border-[#9E1B32] focus-within:ring-1 focus-within:ring-[#9E1B32]">
                  <Github className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
                  <input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                {fieldErrors.github_url && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.github_url[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Uploader Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-3">
            <ImageUploader
              label="Thumbnail *"
              value={thumbnailUrl}
              onChange={(url) => setThumbnailUrl(url)}
              folder="projects/thumbnails"
              aspectRatio="video"
            />
            {fieldErrors.thumbnail_url && (
              <p className="text-xs text-red-400">
                {fieldErrors.thumbnail_url[0]}
              </p>
            )}
          </div>

          {/* Additional Gallery URLs */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Galeri ({galleryUrls.length})
              </h3>
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-3">
              {galleryUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUpdateGalleryUrl(idx, e.target.value)}
                    placeholder="https://... atau /projects/..."
                    className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-[#9E1B32] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryUrl(idx)}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {galleryUrls.length === 0 && (
                <p className="text-xs text-zinc-600 italic">Belum ada foto.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
