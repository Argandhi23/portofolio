'use client';

import { useState, useTransition } from 'react';
import { updateSettings } from '@/actions/settings.actions';
import { AdminLangTabs } from '@/components/admin/AdminLangTabs';
import { ImageUploader } from '@/components/admin/ImageUploader';
import {
  decodeLocalized,
  encodeLocalized,
  type Locale,
  type LocalizedPair,
} from '@/lib/i18n/localized';
import type { SiteSettings } from '@/types/database.types';
import type { SettingsInput } from '@/lib/validations/settings.schema';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { Github } from '@/components/ui/Icons';

interface SettingsFormProps {
  initialSettings: SiteSettings | null;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [activeLang, setActiveLang] = useState<Locale>('en');

  // Hero Fields
  const [brandName, setBrandName] = useState(
    initialSettings?.brand_name || 'Argandhi.'
  );
  const [heroGreeting, setHeroGreeting] = useState<LocalizedPair>(() =>
    decodeLocalized(
      initialSettings?.hero_greeting ||
        "Hi, I'm Faqih Rafasha<!--lang:id-->Halo, saya Faqih Rafasha"
    )
  );
  const [heroTitle, setHeroTitle] = useState<LocalizedPair>(() =>
    decodeLocalized(initialSettings?.hero_title || 'Software Developer')
  );
  const [heroSubtitle, setHeroSubtitle] = useState<LocalizedPair>(() =>
    decodeLocalized(
      initialSettings?.hero_subtitle ||
        'Clean code. Fast products.<!--lang:id-->Kode bersih. Produk cepat.'
    )
  );
  const [heroDescription, setHeroDescription] = useState<LocalizedPair>(() =>
    decodeLocalized(
      initialSettings?.hero_description ||
        'Building web apps, Flutter APKs, and AI tools.<!--lang:id-->Membangun aplikasi web, APK Flutter, dan sistem AI.'
    )
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialSettings?.hero_image_url || ''
  );

  // About Fields
  const [aboutLabel, setAboutLabel] = useState<LocalizedPair>(() =>
    decodeLocalized(
      initialSettings?.about_label || 'About<!--lang:id-->Tentang'
    )
  );
  const [aboutHeading, setAboutHeading] = useState<LocalizedPair>(() =>
    decodeLocalized(
      initialSettings?.about_heading ||
        'Building Practical Digital Products<!--lang:id-->Membangun Produk Digital Fungsional'
    )
  );
  const [aboutDescription, setAboutDescription] = useState<LocalizedPair>(() =>
    decodeLocalized(
      initialSettings?.about_description ||
        'Full-Stack Developer in Surabaya turning ideas into fast, reliable web and mobile apps.<!--lang:id-->Full-Stack Developer di Surabaya yang mengubah ide menjadi aplikasi web & mobile cepat.'
    )
  );

  // Contact & Social Fields
  const [contactEmail, setContactEmail] = useState(
    initialSettings?.contact_email || 'argandhi23@gmail.com'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings?.whatsapp_number || '6285806912873'
  );
  const [githubUrl, setGithubUrl] = useState(
    initialSettings?.github_url || 'https://github.com/Argandhi23'
  );
  const [ctaUrl, setCtaUrl] = useState(initialSettings?.cta_url || '#contact');

  const updatePair = (
    setter: React.Dispatch<React.SetStateAction<LocalizedPair>>,
    val: string
  ) => {
    setter((prev) => ({ ...prev, [activeLang]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const payload: SettingsInput = {
      brand_name: brandName,
      hero_greeting: encodeLocalized(heroGreeting),
      hero_title: encodeLocalized(heroTitle),
      hero_subtitle: encodeLocalized(heroSubtitle),
      hero_description: encodeLocalized(heroDescription),
      hero_image_url: heroImageUrl || null,
      about_label: encodeLocalized(aboutLabel),
      about_heading: encodeLocalized(aboutHeading),
      about_description: encodeLocalized(aboutDescription),
      contact_email: contactEmail || null,
      whatsapp_number: whatsappNumber,
      github_url: githubUrl || null,
      cta_url: ctaUrl || '#contact',
    };

    startTransition(async () => {
      const res = await updateSettings(payload);
      if (!res.success) {
        setError(res.message);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccessMessage('Pengaturan disimpan.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Pengaturan
        </h1>

        <div className="flex items-center gap-3">
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF5510] hover:bg-[#FF6B2B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#FF5510]/20 transition disabled:opacity-50 cursor-pointer"
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

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Section 1: Hero Settings */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold">Hero</h2>
          </div>
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Nama Brand <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
              {fieldErrors.brand_name && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.brand_name[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Greeting ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={heroGreeting[activeLang]}
                  onChange={(e) => updatePair(setHeroGreeting, e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Role ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={heroTitle[activeLang]}
                  onChange={(e) => updatePair(setHeroTitle, e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Subtitle ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={heroSubtitle[activeLang]}
                onChange={(e) => updatePair(setHeroSubtitle, e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Deskripsi ({activeLang.toUpperCase()})
              </label>
              <textarea
                rows={2}
                value={heroDescription[activeLang]}
                onChange={(e) => updatePair(setHeroDescription, e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <ImageUploader
              label="Foto Profil"
              value={heroImageUrl}
              onChange={(url) => setHeroImageUrl(url)}
              folder="hero"
              aspectRatio="square"
            />
          </div>
        </div>
      </div>

      {/* Section 2: About Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold">Tentang</h2>
          </div>
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Label ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={aboutLabel[activeLang]}
              onChange={(e) => updatePair(setAboutLabel, e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Heading ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={aboutHeading[activeLang]}
              onChange={(e) => updatePair(setAboutHeading, e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Deskripsi ({activeLang.toUpperCase()})
          </label>
          <textarea
            rows={3}
            value={aboutDescription[activeLang]}
            onChange={(e) => updatePair(setAboutDescription, e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 3: Contact & CTA */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-white border-b border-zinc-900 pb-3">
          <Mail className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-semibold">Kontak</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <Mail className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="argandhi23@gmail.com"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            {fieldErrors.contact_email && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.contact_email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              WhatsApp <span className="text-orange-500">*</span>
            </label>
            <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <Phone className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="6285806912873"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            {fieldErrors.whatsapp_number && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.whatsapp_number[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              GitHub URL
            </label>
            <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <Github className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/Argandhi23"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            {fieldErrors.github_url && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.github_url[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              URL CTA
            </label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="#contact"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
