import type { Locale } from '@/lib/i18n/localized';

export const PUBLIC_COPY = {
  nav: {
    home: { en: 'Home', id: 'Beranda' },
    about: { en: 'About', id: 'Tentang' },
    projects: { en: 'Projects', id: 'Proyek' },
    services: { en: 'Services', id: 'Layanan' },
    contact: { en: 'Contact', id: 'Kontak' },
    cta: { en: 'Get in touch', id: 'Hubungi' },
  },
  home: {
    techStrip: { en: 'Tech Stack', id: 'Tech Stack' },
    aboutCta: { en: 'Full profile', id: 'Profil lengkap' },
    badgeUnesa: { en: "Informatics UNESA '24", id: "Informatika UNESA '24" },
    badgeAsah: {
      en: 'Asah AI Cohort (Dicoding & GoTo)',
      id: 'Cohort AI Asah (Dicoding & GoTo)',
    },
    manifesto: {
      en: 'Simple on the surface. Fast, clean, and secure underneath.',
      id: 'Simpel di permukaan. Cepat, bersih, dan aman di balik layar.',
      enHighlights: ['Simple', 'Fast', 'clean', 'secure'],
      idHighlights: ['Simpel', 'Cepat', 'bersih', 'aman'],
    },
    projectsEyebrow: { en: 'Projects', id: 'Proyek' },
    projectsHeading: { en: 'Featured Projects', id: 'Proyek Pilihan' },
    projectsLead: {
      en: 'Real-world web apps, mobile APKs, and systems shipped to production.',
      id: 'Aplikasi web, APK mobile, dan sistem nyata di produksi.',
    },
    projectsCta: { en: 'All projects', id: 'Semua proyek' },
    moreProjects: { en: 'More Projects', id: 'Proyek Lainnya' },
    viewAll: { en: 'View all', id: 'Lihat semua' },
    viewProject: { en: 'View', id: 'Lihat' },
    emptyProjectsTitle: {
      en: 'Projects coming soon',
      id: 'Daftar proyek sedang disiapkan',
    },
    emptyProjectsSub: {
      en: 'Publish projects from the Admin Panel to display them here.',
      id: 'Publikasikan proyek dari Panel Admin untuk menampilkannya di sini.',
    },
    servicesEyebrow: { en: 'Services', id: 'Layanan' },
    servicesHeading: { en: 'What I Build', id: 'Layanan Utama' },
    servicesLead: {
      en: 'End-to-end development for web, mobile, and AI.',
      id: 'Pengembangan menyeluruh untuk web, mobile, dan AI.',
    },
    servicesCta: { en: 'Start a project', id: 'Mulai proyek' },
    contactEyebrow: { en: 'Contact', id: 'Kontak' },
    contactHeading: { en: 'Start a Project', id: 'Mulai Proyek' },
    contactLead: {
      en: 'Available for freelance projects and collaborations.',
      id: 'Tersedia untuk proyek freelance dan kolaborasi.',
    },
    contactCta: { en: 'Chat on WhatsApp', id: 'Chat WhatsApp' },
  },
  contactForm: {
    title: { en: 'Send a Message', id: 'Kirim Pesan' },
    nameLabel: { en: 'Name', id: 'Nama' },
    namePlaceholder: { en: 'Your name', id: 'Nama kamu' },
    emailLabel: { en: 'Email', id: 'Email' },
    emailPlaceholder: { en: 'name@email.com', id: 'nama@email.com' },
    subjectLabel: { en: 'Subject', id: 'Subjek' },
    subjectPlaceholder: {
      en: 'Web App, Mobile APK, or AI',
      id: 'Aplikasi Web, APK Mobile, atau AI',
    },
    messageLabel: { en: 'Message', id: 'Pesan' },
    messagePlaceholder: {
      en: 'Briefly describe what you want to build...',
      id: 'Ceritakan singkat proyek yang ingin dibuat...',
    },
    sending: { en: 'Sending...', id: 'Mengirim...' },
    submit: { en: 'Send message', id: 'Kirim pesan' },
    pingWa: { en: 'Chat on WhatsApp now', id: 'Chat di WhatsApp sekarang' },
  },
  footer: {
    openWa: { en: 'Chat on WhatsApp', id: 'Chat WhatsApp' },
    sendEmail: { en: 'Send Email', id: 'Kirim Email' },
    openGithub: { en: 'GitHub Profile', id: 'Profil GitHub' },
    copyEmail: { en: 'COPY', id: 'SALIN' },
    copied: { en: 'COPIED', id: 'TERSALIN' },
    bookendSub: { en: 'Have a project in mind?', id: 'Punya ide proyek?' },
    bookendHeading: { en: "Let's Talk.", id: "Let's Talk." },
    rights: { en: 'All rights reserved.', id: 'Hak cipta dilindungi.' },
  },
} as const;

export function tPick(pair: { en: string; id: string }, locale: Locale): string {
  return locale === 'id' ? pair.id : pair.en;
}
