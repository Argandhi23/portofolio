'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { submitInquiry } from '@/actions/inquiry.actions';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { useLanguage } from '@/components/public/LanguageProvider';
import { PUBLIC_COPY, tPick } from '@/lib/i18n/dictionary';

interface ContactFormProps {
  recipientEmail: string;
  whatsappNumber?: string;
}

export function ContactForm({
  recipientEmail,
  whatsappNumber = '6285806912873',
}: ContactFormProps) {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website_honeypot: '',
  });
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    lastSubmittedBrief?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await submitInquiry(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
        return;
      }

      if (result.data?.fallbackMailto) {
        const emailSubject = encodeURIComponent(
          formData.subject.trim()
            ? `[Portfolio Inquiry] ${formData.subject.trim()}`
            : `[Portfolio Inquiry] Message from ${formData.name.trim()}`
        );
        const emailBody = encodeURIComponent(
          `Halo Faqih,\n\nNama: ${formData.name.trim()}\nEmail: ${formData.email.trim()}\n\nPesan:\n${formData.message.trim()}`
        );
        window.location.href = `mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`;
      }

      const preparedWaText = encodeURIComponent(
        `Halo Faqih, saya ${formData.name.trim()} (${formData.email.trim()}). Saya baru saja mengirim pesan di portofolio Anda${
          formData.subject.trim() ? ` terkait "${formData.subject.trim()}"` : ''
        }.`
      );

      setStatusMessage({
        type: 'success',
        text: result.message,
        lastSubmittedBrief: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${preparedWaText}`,
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        website_honeypot: '',
      });
    });
  };

  return (
    <SpotlightCard className="rounded-[28px] bg-[#121212] border border-white/[0.07] p-7 sm:p-9 shadow-2xl overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-white font-bold text-[22px] sm:text-[25px] leading-[1.18] tracking-[-0.025em] mb-6">
          {tPick(PUBLIC_COPY.contactForm.title, lang)}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Hidden Anti-Bot Honeypot Field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-website-hp">Website</label>
            <input
              id="contact-website-hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website_honeypot}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  website_honeypot: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="contact-name"
                className="block text-[12px] font-semibold text-white/85"
              >
                {tPick(PUBLIC_COPY.contactForm.nameLabel, lang)}
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder={tPick(PUBLIC_COPY.contactForm.namePlaceholder, lang)}
                required
                disabled={isPending}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-2xl bg-[#181818] border border-white/[0.08] px-4 py-3 text-[13.5px] text-white placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#9E1B32] transition disabled:opacity-60"
              />
              {fieldErrors.name?.[0] && (
                <p className="text-[11.5px] text-red-400">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-email"
                className="block text-[12px] font-semibold text-white/85"
              >
                {tPick(PUBLIC_COPY.contactForm.emailLabel, lang)}
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder={tPick(PUBLIC_COPY.contactForm.emailPlaceholder, lang)}
                required
                disabled={isPending}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-2xl bg-[#181818] border border-white/[0.08] px-4 py-3 text-[13.5px] text-white placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#9E1B32] transition disabled:opacity-60"
              />
              {fieldErrors.email?.[0] && (
                <p className="text-[11.5px] text-red-400">{fieldErrors.email[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contact-subject"
              className="block text-[12px] font-semibold text-white/85"
            >
              {tPick(PUBLIC_COPY.contactForm.subjectLabel, lang)}
            </label>
            <input
              id="contact-subject"
              type="text"
              placeholder={tPick(PUBLIC_COPY.contactForm.subjectPlaceholder, lang)}
              disabled={isPending}
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full rounded-2xl bg-[#181818] border border-white/[0.08] px-4 py-3 text-[13.5px] text-white placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#9E1B32] transition disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contact-message"
              className="block text-[12px] font-semibold text-white/85"
            >
              {tPick(PUBLIC_COPY.contactForm.messageLabel, lang)}
            </label>
            <textarea
              id="contact-message"
              rows={4}
              required
              disabled={isPending}
              placeholder={tPick(PUBLIC_COPY.contactForm.messagePlaceholder, lang)}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full rounded-2xl bg-[#181818] border border-white/[0.08] px-4 py-3 text-[13.5px] text-white placeholder:text-[#7A7A7A] focus:outline-none focus:border-[#9E1B32] transition resize-none disabled:opacity-60"
            />
            {fieldErrors.message?.[0] && (
              <p className="text-[11.5px] text-red-400">{fieldErrors.message[0]}</p>
            )}
          </div>

          {statusMessage && (
            <div
              role="status"
              className={`rounded-2xl border p-4 text-[12.5px] space-y-2.5 ${
                statusMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-white/95'
                  : 'border-red-500/30 bg-red-500/10 text-red-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>

              {statusMessage.lastSubmittedBrief && (
                <div className="pl-6 pt-1">
                  <a
                    href={statusMessage.lastSubmittedBrief}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E1B32] hover:text-[#B8233E] transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>
                      {tPick(PUBLIC_COPY.contactForm.pingWa, lang)} &rarr;
                    </span>
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="pill-btn inline-flex items-center gap-3 bg-[#9E1B32] hover:bg-[#B8233E] text-white pl-5 pr-1.5 py-1.5 rounded-full text-[13px] font-semibold shadow-lg shadow-[#9E1B32]/20 cursor-pointer disabled:opacity-60"
            >
              <span>
                {isPending
                  ? tPick(PUBLIC_COPY.contactForm.sending, lang)
                  : tPick(PUBLIC_COPY.contactForm.submit, lang)}
              </span>
              <span className="arrow-circle w-7 h-7 rounded-full bg-white text-[#9E1B32] flex items-center justify-center">
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="arrow-track">
                    <svg
                      className="w-3.5 h-3.5 arrow-icon-primary"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg
                      className="w-3.5 h-3.5 arrow-icon-Clone"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </SpotlightCard>
  );
}
