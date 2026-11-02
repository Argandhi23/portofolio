import Link from 'next/link';
import { ArrowUpRight, ChevronUp, Mail, Phone } from 'lucide-react';
import type { SiteSettings } from '@/types/database.types';
import { Github } from '@/components/ui/Icons';
import { PillButton } from '@/components/public/PillButton';
import { ContactForm } from '@/components/public/ContactForm';
import { CopyEmailButton } from '@/components/public/CopyEmailButton';
import { SectionHeader } from '@/components/public/SectionHeader';
import { HeroAmbientGlow } from '@/components/motion/HeroAmbientGlow';
import { FooterCurtain } from '@/components/motion/FooterCurtain';
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
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-6 transition-colors space-y-4 overflow-hidden">
                  <div className="relative z-10 space-y-4">
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
                      <p className="text-[#7A7A7A] text-[12.5px] mt-1">
                        Instant discussion for project scope, timeline, and estimates.
                      </p>
                    </div>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white hover:text-[#FF5510] transition"
                    >
                      <span>Open WhatsApp Chat</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#FF5510]" />
                    </a>
                  </div>
                </SpotlightCard>
              </Reveal>

              {/* 2. Email */}
              <Reveal variant="fade-up" delay={140}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-6 transition-colors space-y-4 overflow-hidden">
                  <div className="relative z-10 space-y-4">
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
                      <p className="text-[#7A7A7A] text-[12.5px] mt-1">
                        Send technical specifications, RFPs, or collaboration invites.
                      </p>
                    </div>

                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white hover:text-[#FF5510] transition"
                    >
                      <span>Compose Direct Email</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#FF5510]" />
                    </a>
                  </div>
                </SpotlightCard>
              </Reveal>

              {/* 3. GitHub */}
              <Reveal variant="fade-up" delay={210}>
                <SpotlightCard className="rounded-[24px] bg-[#121212] border border-white/[0.07] hover:border-[#FF5510]/40 p-6 transition-colors space-y-4 overflow-hidden">
                  <div className="relative z-10 space-y-4">
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
                      <p className="text-[#7A7A7A] text-[12.5px] mt-1">
                        Explore open-source repositories, commits, and system code.
                      </p>
                    </div>

                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white hover:text-[#FF5510] transition"
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
          FIERY SUNSET GLOW BOOKEND FOOTER (DESIGN_SYSTEM.MD SECTION 5.F)
          Rounded Top 42px with GSAP-Grade Curtain Unveil Expansion
      ===================================================================== */}
      <FooterCurtain>
        <footer className="footer-bookend-card px-6 sm:px-12 pt-16 sm:pt-22 pb-10">
          <HeroAmbientGlow />
          <div className="hero-glow-bottom" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-[1140px] mx-auto space-y-14">
            {/* Top Giant Display Bookend Callout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-8 space-y-3">
                <Reveal variant="fade-up">
                  <p className="text-white/90 text-[16px] sm:text-[19px] font-semibold tracking-[-0.02em]">
                    Ready to build something extraordinary?
                  </p>
                </Reveal>
                <Reveal variant="mask-up" delay={140}>
                  <h2 className="text-white font-bold text-[54px] sm:text-[78px] lg:text-[92px] leading-[0.92] tracking-[-0.04em]">
                    Let&apos;s Talk.
                  </h2>
                </Reveal>
              </div>

              <Reveal
                variant="fade-up"
                delay={240}
                className="md:col-span-4 flex flex-col items-start md:items-end justify-end space-y-4 pb-1"
              >
                <p className="text-white/80 text-[13px] sm:text-[14px] leading-[1.55] md:text-right max-w-[280px]">
                  Faqih Rafasha Argandhi — Full-Stack &amp; Software Developer
                  based in Surabaya, Indonesia.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <PillButton href={whatsappLink} variant="white" external>
                    Start a conversation
                  </PillButton>
                </div>
              </Reveal>
            </div>

            {/* Bottom Navigation & Copyright Bar */}
            <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-[12.5px] text-white/75">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="text-white font-bold text-[16px] tracking-[-0.03em]"
                >
                  {brandName}
                </Link>
                <span className="text-white/40">&bull;</span>
                <span>S1 Informatics Engineering UNESA &apos;24</span>
              </div>

              <nav className="flex flex-wrap items-center gap-6 font-medium text-white/85">
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
                <Link href="/projects" className="hover:text-white transition">
                  Projects
                </Link>
                <Link href="/#services" className="hover:text-white transition">
                  Services
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-white hover:opacity-85 transition"
                >
                  <span>Top</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </a>
              </nav>

              <p className="text-white/65">
                &copy; {currentYear} {brandName} All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </FooterCurtain>
    </div>
  );
}
