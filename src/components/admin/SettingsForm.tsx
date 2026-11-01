'use client';

import { useState, useTransition } from 'react';
import { updateSettings } from '@/actions/settings.actions';
import { ImageUploader } from '@/components/admin/ImageUploader';
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

  // Hero Fields
  const [brandName, setBrandName] = useState(initialSettings?.brand_name || 'Argandhi.');
  const [heroGreeting, setHeroGreeting] = useState(initialSettings?.hero_greeting || "Hey, I'm Faqih Rafasha — Full-Stack &");
  const [heroTitle, setHeroTitle] = useState(initialSettings?.hero_title || 'Software Developer');
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings?.hero_subtitle || 'Great software should feel effortless.');
  const [heroDescription, setHeroDescription] = useState(initialSettings?.hero_description || "Informatics Engineering student at UNESA ('24) & Freelance Full-Stack Developer crafting fast, scalable web apps, mobile APKs, and AI-powered software.");
  const [heroImageUrl, setHeroImageUrl] = useState(initialSettings?.hero_image_url || '');

  // About Fields
  const [aboutLabel, setAboutLabel] = useState(initialSettings?.about_label || 'Behind the Code');
  const [aboutHeading, setAboutHeading] = useState(initialSettings?.about_heading || 'Engineering Digital Products That Solve Real Problems');
  const [aboutDescription, setAboutDescription] = useState(initialSettings?.about_description || "I'm Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. With multiple production-ready websites and mobile APKs running live, I help businesses and clients turn complex ideas into clean, secure, and high-performance applications.");

  // Contact & Social Fields
  const [contactEmail, setContactEmail] = useState(initialSettings?.contact_email || 'argandhi23@gmail.com');
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings?.whatsapp_number || '6285806912873');
  const [githubUrl, setGithubUrl] = useState(initialSettings?.github_url || 'https://github.com/Argandhi23');
  const [ctaUrl, setCtaUrl] = useState(initialSettings?.cta_url || '#contact');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const payload: SettingsInput = {
      brand_name: brandName,
      hero_greeting: heroGreeting,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_description: heroDescription,
      hero_image_url: heroImageUrl || null,
      about_label: aboutLabel,
      about_heading: aboutHeading,
      about_description: aboutDescription,
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
        setSuccessMessage('Pengaturan situs berhasil diperbarui dan cache publik telah diperbarui!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Pengaturan Teks & Kontak Portofolio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Konfigurasi teks Hero Section, About Section, email kontak, dan tombol CTA utama.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/10 hover:from-orange-600 hover:to-red-700 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
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
        <div className="flex items-center gap-2 text-white border-b border-zinc-900 pb-3">
          <Sparkles className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-semibold">Hero Section (Bagian Utama)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Nama Brand / Portfolio Title <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
              {fieldErrors.brand_name && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.brand_name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Greeting Hero
                </label>
                <input
                  type="text"
                  required
                  value={heroGreeting}
                  onChange={(e) => setHeroGreeting(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Judul Hero (Role)
                </label>
                <input
                  type="text"
                  required
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Subtitle Hero
              </label>
              <input
                type="text"
                required
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Deskripsi Paragraf Hero
              </label>
              <textarea
                rows={3}
                required
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <ImageUploader
              label="Foto Profil / Ilustrasi Hero"
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
        <div className="flex items-center gap-2 text-white border-b border-zinc-900 pb-3">
          <User className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-semibold">About Section (Tentang Saya)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Label About (Kecil)
            </label>
            <input
              type="text"
              required
              value={aboutLabel}
              onChange={(e) => setAboutLabel(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Heading Utama About
            </label>
            <input
              type="text"
              required
              value={aboutHeading}
              onChange={(e) => setAboutHeading(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Deskripsi Narasi About
          </label>
          <textarea
            rows={4}
            required
            value={aboutDescription}
            onChange={(e) => setAboutDescription(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 3: Contact & CTA */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
        <div className="flex items-center gap-2 text-white border-b border-zinc-900 pb-3">
          <Mail className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-semibold">Kontak & Call to Action (CTA)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Email Kontak Portofolio
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
              <p className="mt-1 text-xs text-red-400">{fieldErrors.contact_email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Nomor WhatsApp (Contoh: 6285806912873) <span className="text-orange-500">*</span>
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
              <p className="mt-1 text-xs text-red-400">{fieldErrors.whatsapp_number[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Tautan Profil GitHub
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
              <p className="mt-1 text-xs text-red-400">{fieldErrors.github_url[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Tautan Tombol CTA (Contoh: #contact atau mailto:...)
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
