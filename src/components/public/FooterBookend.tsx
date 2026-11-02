import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import type { SiteSettings } from '@/types/database.types';
import { Github } from '@/components/ui/Icons';
import { PillButton } from '@/components/public/PillButton';
import { ContactForm } from '@/components/public/ContactForm';
import { CopyEmailButton } from '@/components/public/CopyEmailButton';
import { SectionHeader } from '@/components/public/SectionHeader';
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
  const whatsappLink = `https://wa.me/${whatsappCleaned}?text=Halo%20Faqih,%20saya%20tertarik%20untuk%20berdiskusi%20tentang%20proyek%20software%20/%20website`;
  const whatsappDisplay = formatWhatsAppDisplay(whatsappNumber);
  const currentYear = new Date().getFullYear();

  return (
    <div id="contact" className="bg-[#080808] pt-16">
      {/* =====================================================================
          OPTIONAL CONTACT & DIRECT CHANNELS SECTION (ON #080808)
      ===================================================================== */}
      {showContactGrid && (
        <section className="w-full max-w-[1140px] mx-auto px-6 sm:px-12 pb-20 sm:pb-24 space-y-14">
          <SectionHeader
            eyebrow="Get in Touch"
            heading={
              <>
                Let&apos;s Engineer Your
                <br />
                Next Digital Product
              </>
            }
            lead={
              <>
                Available for freelance web platforms, mobile APK development,
                and software architecture consultations from Surabaya to
                anywhere.
              </>
            }
            microLabel={
              <>
                Fast Response via
                <br />
                WhatsApp or System Inbox
              </>
            }
            ctaHref={whatsappLink}
            ctaLabel="Chat on WhatsApp"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Database-Backed Folioblox Project Inquiry Form */}
            <Reveal variant="fade-up" className="lg:col-span-7">
              <ContactForm
                recipientEmail={contactEmail}
                whatsappNumber={whatsappNumber}
              />
            </Reveal>

            {/* Right 5 Columns: 3 Direct Channels (#121212 Rounded-[24px] Cards) */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. WhatsApp */}
              <Reveal variant="fade-up" delay={70}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-5 sm:p-6 transition-colors space-y-3 overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-[#FF5510]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">
                        <span className="text-[#FF5510]">#</span>
                        <span className="text-white">01</span>
                        <span className="text-[#7A7A7A] font-medium ml-1.5">
                          WHATSAPP
                        </span>
                      </span>
                    </div>

                    <div>
                      <p className="text-white font-bold text-[19px] tracking-[-0.02em]">
                        {whatsappDisplay}
                      </p>
                    </div>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 hover:text-[#FF5510] transition"
                    >
                      <span>Open WhatsApp Chat</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#FF5510]" />
                    </a>
                  </div>
                </SpotlightCard>
              </Reveal>

              {/* 2. Email */}
              <Reveal variant="fade-up" delay={140}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-5 sm:p-6 transition-colors space-y-3 overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-[#FF5510]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <CopyEmailButton email={contactEmail} />
                    </div>

                    <div>
                      <p className="text-white font-bold text-[18px] tracking-[-0.02em] truncate">
                        {contactEmail}
                      </p>
                    </div>

                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 hover:text-[#FF5510] transition"
                    >
                      <span>Compose Direct Email</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#FF5510]" />
                    </a>
                  </div>
                </SpotlightCard>
              </Reveal>

              {/* 3. GitHub */}
              <Reveal variant="fade-up" delay={210}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-5 sm:p-6 transition-colors space-y-3 overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white">
                        <Github className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight">
                        <span className="text-[#FF5510]">#</span>
                        <span className="text-white">03</span>
                        <span className="text-[#7A7A7A] font-medium ml-1.5">
                          GITHUB
                        </span>
                      </span>
                    </div>

                    <div>
                      <p className="text-white font-bold text-[18px] tracking-[-0.02em]">
                        github.com/Argandhi23
                      </p>
                    </div>

                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 hover:text-[#FF5510] transition"
                    >
                      <span>Explore GitHub Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#FF5510]" />
                    </a>
                  </div>
                </SpotlightCard>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          FIERY SUNSET GLOW BOOKEND FOOTER
          Clean, Static Warm Radial Gradient with Massive "Let's Talk." Display
      ===================================================================== */}
      <footer className="footer-bookend-card px-6 sm:px-12 pt-16 sm:pt-24 pb-12">
        <div className="relative z-10 w-full max-w-[1140px] mx-auto space-y-14">
          {/* Top Giant Display Bookend Callout */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
            <div className="space-y-3 max-w-3xl">
              <Reveal variant="fade-up">
                <p className="text-white/85 text-[15px] sm:text-[18px] font-semibold tracking-[-0.02em]">
                  Ready to build something extraordinary?
                </p>
              </Reveal>
              <Reveal variant="mask-up" delay={120}>
                <h2 className="text-white font-bold text-[68px] sm:text-[104px] lg:text-[132px] leading-[0.88] tracking-[-0.04em]">
                  Let&apos;s Talk.
                </h2>
              </Reveal>
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
                Get in touch
              </PillButton>
            </Reveal>
          </div>

          {/* Bottom Ultra-Minimal Copyright Bar */}
          <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/70">
            <Link
              href="/"
              className="text-white font-bold text-[17px] tracking-[-0.03em] hover:opacity-90 transition"
            >
              {brandName}
            </Link>

            <p className="text-white/60 text-center sm:text-right">
              &copy; {currentYear} {brandName} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
