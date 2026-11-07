import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { SiteSettings } from '@/types/database.types';
import { PillButton } from '@/components/public/PillButton';
import { ContactForm } from '@/components/public/ContactForm';
import { CopyEmailButton } from '@/components/public/CopyEmailButton';
import { SectionHeader } from '@/components/public/SectionHeader';
import { T } from '@/components/public/LanguageProvider';
import { FooterCurtain } from '@/components/motion/FooterCurtain';
import { GsapContactCockpit } from '@/components/motion/GsapContactCockpit';
import { GsapSplitText } from '@/components/motion/GsapSplitText';
import { Reveal } from '@/components/motion/Reveal';

interface FooterBookendProps {
  settings: SiteSettings;
  showContactGrid?: boolean;
}

const LETS_TALK_CHARS = [
  'L',
  'e',
  't',
  '\u2019',
  's',
  '\u00A0',
  'T',
  'a',
  'l',
  'k',
  '.',
];

function formatWhatsAppDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    const local = '0' + digits.slice(2);
    if (local.length >= 11) {
      return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
    }
    return local;
  }
  return phone;
}

export function FooterBookend({
  settings,
  showContactGrid = true,
}: FooterBookendProps) {
  const brandName = settings.brand_name || 'Argandhi.';
  const contactEmail = settings.contact_email || 'argandhi23@gmail.com';
  const whatsappNumber = settings.whatsapp_number || '6285806912873';
  const githubUrl = settings.github_url || 'https://github.com/Argandhi23';

  const whatsappCleaned = whatsappNumber.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappCleaned}?text=Halo%20Faqih,%20saya%20ingin%20berdiskusi%20tentang%20proyek%20software`;
  const whatsappDisplay = formatWhatsAppDisplay(whatsappNumber);
  const currentYear = new Date().getFullYear();

  return (
    <GsapContactCockpit>
      <div id="contact" className="bg-[#080808] pt-16">
        {showContactGrid && (
          <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pb-20 sm:pb-24 space-y-16">
            <SectionHeader
              eyebrow={<T en="Contact" id="Kontak" />}
              heading={<T en="Start a Project" id="Mulai Proyek" />}
              lead={
                <T
                  en="Available for freelance projects and collaborations."
                  id="Tersedia untuk proyek freelance dan kolaborasi."
                />
              }
              ctaHref={whatsappLink}
              ctaLabel={<T en="Chat on WhatsApp" id="Chat WhatsApp" />}
            />

            <div
              data-gsap-cockpit-grid
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              <div
                data-gsap-cockpit-left
                className="lg:col-span-7 will-change-transform"
              >
                <ContactForm
                  recipientEmail={contactEmail}
                  whatsappNumber={whatsappNumber}
                />
              </div>

              {/* Minimalist Editorial Contact Directory (No boxes, no badges) */}
              <div className="lg:col-span-5 pt-2">
                <div
                  data-gsap-contact-line
                  className="h-[1px] w-full bg-white/12 origin-left will-change-transform"
                />

                {/* 1. WhatsApp */}
                <div
                  data-gsap-cockpit-right
                  className="py-6 space-y-2 will-change-transform"
                >
                  <div className="flex items-center justify-between text-xs text-white/45 font-mono">
                    <span>01 / WHATSAPP</span>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/75 hover:text-[#E04D70] transition"
                    >
                      <span>
                        <T en="Message" id="Kirim pesan" />
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white font-bold text-[22px] tracking-[-0.02em] hover:text-[#E04D70] transition-colors"
                  >
                    <GsapSplitText>{whatsappDisplay}</GsapSplitText>
                  </a>
                </div>

                <div
                  data-gsap-contact-line
                  className="h-[1px] w-full bg-white/12 origin-left will-change-transform"
                />

                {/* 2. Email */}
                <div
                  data-gsap-cockpit-right
                  className="py-6 space-y-2 will-change-transform"
                >
                  <div className="flex items-center justify-between text-xs text-white/45 font-mono">
                    <span>02 / EMAIL</span>
                    <CopyEmailButton email={contactEmail} />
                  </div>

                  <a
                    href={`mailto:${contactEmail}`}
                    className="block text-white font-bold text-[20px] tracking-[-0.02em] truncate hover:text-[#E04D70] transition-colors"
                  >
                    <GsapSplitText>{contactEmail}</GsapSplitText>
                  </a>
                </div>

                <div
                  data-gsap-contact-line
                  className="h-[1px] w-full bg-white/12 origin-left will-change-transform"
                />

                {/* 3. GitHub */}
                <div
                  data-gsap-cockpit-right
                  className="py-6 space-y-2 will-change-transform"
                >
                  <div className="flex items-center justify-between text-xs text-white/45 font-mono">
                    <span>03 / GITHUB</span>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/75 hover:text-[#E04D70] transition"
                    >
                      <span>
                        <T en="Profile" id="Profil" />
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white font-bold text-[20px] tracking-[-0.02em] hover:text-[#E04D70] transition-colors"
                  >
                    <GsapSplitText>github.com/Argandhi23</GsapSplitText>
                  </a>
                </div>

                <div
                  data-gsap-contact-line
                  className="h-[1px] w-full bg-white/12 origin-left will-change-transform"
                />
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            FIERY SUNSET GLOW BOOKEND FOOTER (3D CURTAIN UNVEIL + KINETIC HEADING)
        ===================================================================== */}
        <FooterCurtain>
          <footer className="footer-bookend-card px-6 sm:px-12 pt-16 sm:pt-24 pb-12">
            <div className="relative z-10 w-full max-w-[1140px] mx-auto space-y-14">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-3 max-w-3xl">
                  <p className="text-white/85 text-[15px] sm:text-[18px] font-semibold tracking-[-0.02em]">
                    <GsapSplitText>
                      <T en="Have a project in mind?" id="Punya ide proyek?" />
                    </GsapSplitText>
                  </p>
                  <div
                    style={{
                      transform:
                        'translate3d(0, calc((1 - var(--footer-progress, 1)) * 28px), 0) scale(calc(0.92 + var(--footer-progress, 1) * 0.08))',
                    }}
                    className="origin-left will-change-transform"
                  >
                    <h2
                      aria-label="Let's Talk."
                      className="text-white font-bold text-[68px] sm:text-[104px] lg:text-[132px] leading-[0.88] tracking-[-0.04em]"
                    >
                      <span className="sr-only">Let&apos;s Talk.</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex flex-wrap overflow-hidden pb-2 -mb-2"
                      >
                        {LETS_TALK_CHARS.map((ch, idx) => (
                          <span
                            key={idx}
                            data-gsap-footer-char
                            className="inline-block will-change-transform"
                          >
                            {ch === '\u2019' ? "'" : ch}
                          </span>
                        ))}
                      </span>
                    </h2>
                  </div>
                </div>

                <Reveal
                  variant="fade-up"
                  delay={220}
                  className="shrink-0 pb-1"
                >
                  <div
                    data-gsap-magnetic-cta
                    className="inline-block will-change-transform"
                  >
                    <PillButton
                      href={whatsappLink}
                      variant="white"
                      external
                      className="!text-[14px] !py-2.5 !px-6 shadow-2xl"
                    >
                      <T en="Get in touch" id="Hubungi" />
                    </PillButton>
                  </div>
                </Reveal>
              </div>

              <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/70">
                <Link
                  href="/"
                  className="text-white font-bold text-[17px] tracking-[-0.03em] hover:opacity-90 transition"
                >
                  {brandName}
                </Link>

                <p className="text-white/60 text-center sm:text-right">
                  &copy; {currentYear} {brandName}{' '}
                  <T en="All rights reserved." id="Hak cipta dilindungi." />
                </p>
              </div>
            </div>
          </footer>
        </FooterCurtain>
      </div>
    </GsapContactCockpit>
  );
}
