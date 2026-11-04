import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import type { SiteSettings } from '@/types/database.types';
import { Github } from '@/components/ui/Icons';
import { PillButton } from '@/components/public/PillButton';
import { ContactForm } from '@/components/public/ContactForm';
import { CopyEmailButton } from '@/components/public/CopyEmailButton';
import { SectionHeader } from '@/components/public/SectionHeader';
import { T } from '@/components/public/LanguageProvider';
import { FooterCurtain } from '@/components/motion/FooterCurtain';
import { ScrollPerspectiveCard } from '@/components/motion/ScrollPerspectiveCard';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';

interface FooterBookendProps {
  settings: SiteSettings;
  showContactGrid?: boolean;
}

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
    <div id="contact" className="bg-[#080808] pt-16">
      {showContactGrid && (
        <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pb-20 sm:pb-24 space-y-14">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <ScrollPerspectiveCard className="lg:col-span-7" intensity={0.9}>
              <ContactForm
                recipientEmail={contactEmail}
                whatsappNumber={whatsappNumber}
              />
            </ScrollPerspectiveCard>

            <div className="lg:col-span-5 space-y-4">
              {/* 1. WhatsApp */}
              <ScrollPerspectiveCard intensity={0.85}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#9E1B32]/40 p-5 sm:p-6 transition-colors space-y-3 overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-[#9E1B32]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">
                        <span className="text-[#9E1B32]">#</span>
                        <span className="text-white">01</span>
                        <span className="text-[#7A7A7A] font-medium ml-1.5">
                          WHATSAPP
                        </span>
                      </span>
                    </div>

                    <p className="text-white font-bold text-[19px] tracking-[-0.02em]">
                      {whatsappDisplay}
                    </p>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 hover:text-[#9E1B32] transition"
                    >
                      <span>
                        <T en="Chat on WhatsApp" id="Chat WhatsApp" />
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#9E1B32]" />
                    </a>
                  </div>
                </SpotlightCard>
              </ScrollPerspectiveCard>

              {/* 2. Email */}
              <ScrollPerspectiveCard intensity={0.85}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#9E1B32]/40 p-5 sm:p-6 transition-colors space-y-3 overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-[#9E1B32]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <CopyEmailButton email={contactEmail} />
                    </div>

                    <p className="text-white font-bold text-[18px] tracking-[-0.02em] truncate">
                      {contactEmail}
                    </p>

                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 hover:text-[#9E1B32] transition"
                    >
                      <span>
                        <T en="Send Email" id="Kirim Email" />
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#9E1B32]" />
                    </a>
                  </div>
                </SpotlightCard>
              </ScrollPerspectiveCard>

              {/* 3. GitHub */}
              <ScrollPerspectiveCard intensity={0.85}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#9E1B32]/40 p-5 sm:p-6 transition-colors space-y-3 overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white">
                        <Github className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">
                        <span className="text-[#9E1B32]">#</span>
                        <span className="text-white">03</span>
                        <span className="text-[#7A7A7A] font-medium ml-1.5">
                          GITHUB
                        </span>
                      </span>
                    </div>

                    <p className="text-white font-bold text-[18px] tracking-[-0.02em]">
                      github.com/Argandhi23
                    </p>

                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 hover:text-[#9E1B32] transition"
                    >
                      <span>
                        <T en="GitHub Profile" id="Profil GitHub" />
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#9E1B32]" />
                    </a>
                  </div>
                </SpotlightCard>
              </ScrollPerspectiveCard>
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
                <Reveal variant="fade-up">
                  <p className="text-white/85 text-[15px] sm:text-[18px] font-semibold tracking-[-0.02em]">
                    <T en="Have a project in mind?" id="Punya ide proyek?" />
                  </p>
                </Reveal>
                <div
                  style={{
                    transform:
                      'translate3d(0, calc((1 - var(--footer-progress, 1)) * 28px), 0) scale(calc(0.92 + var(--footer-progress, 1) * 0.08))',
                  }}
                  className="origin-left will-change-transform"
                >
                  <h2 className="text-white font-bold text-[68px] sm:text-[104px] lg:text-[132px] leading-[0.88] tracking-[-0.04em]">
                    Let&apos;s Talk.
                  </h2>
                </div>
              </div>

              <Reveal
                variant="fade-up"
                delay={220}
                className="shrink-0 pb-1"
              >
                <PillButton
                  href={whatsappLink}
                  variant="white"
                  external
                  className="!text-[14px] !py-2.5 !px-6 shadow-2xl"
                >
                  <T en="Get in touch" id="Hubungi" />
                </PillButton>
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
  );
}
