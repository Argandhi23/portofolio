'use client';

import { useState, useTransition } from 'react';
import { updateSettings } from '@/actions/settings.actions';
import { AdminLangTabs } from '@/components/admin/AdminLangTabs';
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
      hero_image_url: null,
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
        setSuccessMessage(res.message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2.5 text-sm text-white placeholder-white/35 focus:border-[#9E1B32] focus:outline-none transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Pengaturan Situs
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Kelola teks Hero (karakter 3D aktif), Tentang, dan informasi Kontak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Section 1: Hero Settings (3D Character Mode) */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3.5">
          <div className="flex items-center gap-2.5 text-white">
            <Sparkles className="h-4 w-4 text-[#9E1B32]" />
            <h2 className="text-sm font-bold">Hero Section</h2>
            <span className="rounded-full bg-[#181818] border border-white/[0.07] px-2.5 py-0.5 text-[10px] font-mono text-white/60">
              Visual 3D Aktif
            </span>
          </div>
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Nama Brand <span className="text-[#9E1B32]">*</span>
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.brand_name && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.brand_name[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Greeting ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={heroGreeting[activeLang]}
              onChange={(e) => updatePair(setHeroGreeting, e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Role / Judul ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={heroTitle[activeLang]}
              onChange={(e) => updatePair(setHeroTitle, e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Subtitle ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={heroSubtitle[activeLang]}
              onChange={(e) => updatePair(setHeroSubtitle, e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Deskripsi Singkat ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={heroDescription[activeLang]}
              onChange={(e) => updatePair(setHeroDescription, e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Section 2: About Section */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3.5">
          <div className="flex items-center gap-2.5 text-white">
            <User className="h-4 w-4 text-[#9E1B32]" />
            <h2 className="text-sm font-bold">Tentang (About)</h2>
          </div>
          <AdminLangTabs value={activeLang} onChange={setActiveLang} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Label ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={aboutLabel[activeLang]}
              onChange={(e) => updatePair(setAboutLabel, e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Heading ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={aboutHeading[activeLang]}
              onChange={(e) => updatePair(setAboutHeading, e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Deskripsi ({activeLang.toUpperCase()})
          </label>
          <textarea
            rows={3}
            value={aboutDescription[activeLang]}
            onChange={(e) => updatePair(setAboutDescription, e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Section 3: Contact & CTA */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-white border-b border-white/[0.07] pb-3.5">
          <Mail className="h-4 w-4 text-[#9E1B32]" />
          <h2 className="text-sm font-bold">Kontak & Tautan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              Email
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2.5 text-sm focus-within:border-[#9E1B32] transition-colors">
              <Mail className="h-3.5 w-3.5 text-white/40 mr-2.5 shrink-0" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="argandhi23@gmail.com"
                className="w-full bg-transparent text-xs text-white placeholder-white/35 focus:outline-none"
              />
            </div>
            {fieldErrors.contact_email && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.contact_email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              WhatsApp <span className="text-[#9E1B32]">*</span>
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2.5 text-sm focus-within:border-[#9E1B32] transition-colors">
              <Phone className="h-3.5 w-3.5 text-white/40 mr-2.5 shrink-0" />
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="6285806912873"
                className="w-full bg-transparent text-xs text-white placeholder-white/35 focus:outline-none"
              />
            </div>
            {fieldErrors.whatsapp_number && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.whatsapp_number[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              GitHub URL
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-white/[0.08] bg-[#181818] px-3.5 py-2.5 text-sm focus-within:border-[#9E1B32] transition-colors">
              <Github className="h-3.5 w-3.5 text-white/40 mr-2.5 shrink-0" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/Argandhi23"
                className="w-full bg-transparent text-xs text-white placeholder-white/35 focus:outline-none"
              />
            </div>
            {fieldErrors.github_url && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.github_url[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">
              URL Tombol CTA
            </label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="#contact"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
