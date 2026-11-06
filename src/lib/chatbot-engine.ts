import { pickLocalized, type Locale } from '@/lib/i18n/localized';
import type {
  ChatActionLink,
  ChatReplyPayload,
} from '@/lib/validations/chat.schema';
import type {
  Brand,
  ProjectSummary,
  Service,
  SiteSettings,
} from '@/types/database.types';

export interface PortfolioChatContext {
  settings: SiteSettings;
  services: Service[];
  brands: Brand[];
  projects: ProjectSummary[];
}

type ChatTone = 'casual' | 'normal';

/**
 * Detects whether the user is chatting in casual/slang style ("bro", "bang", "gimana", "gak", etc.)
 * so replies can naturally mirror their vibe.
 */
function detectChatTone(raw: string): ChatTone {
  const lower = raw.toLowerCase();
  if (
    /\b(bro|bang|bg|gan|bre|cuy|woi|wey|lu|lo|gue|gw|gak|ga|gk|nggak|gimana|gmn|brp|bikin|bikinin|duit|dong|nih|sih|deh|kok|udah|udh|blm|mantap|keren|asik|p|tes|test)\b/.test(
      lower
    )
  ) {
    return 'casual';
  }
  return 'normal';
}

const SLANG_MAP: Record<string, string> = {
  yg: 'yang',
  gk: 'tidak',
  ga: 'tidak',
  gak: 'tidak',
  nggak: 'tidak',
  udah: 'sudah',
  udh: 'sudah',
  blm: 'belum',
  gimana: 'bagaimana',
  gmn: 'bagaimana',
  brp: 'berapa',
  berapaan: 'berapa harga',
  bikin: 'buat',
  bikinin: 'buat',
  pembuatan: 'buat',
  bisa: 'dapat',
  bs: 'dapat',
  wa: 'whatsapp',
  nomer: 'nomor',
  no: 'nomor',
  kontak: 'hubungi',
  kerja: 'pengalaman',
  kerjaan: 'proyek',
  project: 'proyek',
  projects: 'proyek',
  projek: 'proyek',
  portofolio: 'proyek',
  portfolio: 'proyek',
  web: 'website',
  aplikasi: 'app',
  andro: 'android',
  hp: 'mobile',
  biaya: 'harga',
  tarif: 'harga',
  rate: 'harga',
  cost: 'harga',
  price: 'harga',
  pricing: 'harga',
  budget: 'harga',
  duit: 'harga',
  lama: 'durasi',
  waktu: 'durasi',
  estimasi: 'durasi',
  timeline: 'durasi',
  tinggal: 'lokasi',
  domisili: 'lokasi',
  asal: 'lokasi',
  kota: 'lokasi',
  kuliah: 'pendidikan',
  kampus: 'pendidikan',
  univ: 'pendidikan',
  universitas: 'pendidikan',
  jurusan: 'pendidikan',
  prodi: 'pendidikan',
  sekolah: 'pendidikan',
  sma: 'pendidikan',
  man: 'pendidikan',
  pkl: 'magang',
  intern: 'magang',
  internship: 'magang',
  skill: 'keahlian',
  skills: 'keahlian',
  tools: 'teknologi',
  bahasa: 'teknologi',
  framework: 'teknologi',
  stack: 'teknologi',
  makasih: 'terimakasih',
  thanks: 'terimakasih',
  thank: 'terimakasih',
  thx: 'terimakasih',
  tq: 'terimakasih',
};

function normalizeAndTokenize(raw: string): {
  rawCleaned: string;
  cleaned: string;
  tokens: string[];
} {
  const rawCleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = rawCleaned ? rawCleaned.split(' ') : [];
  const mappedTokens = rawTokens.map((t) => SLANG_MAP[t] ?? t);

  return {
    rawCleaned,
    cleaned: mappedTokens.join(' '),
    tokens: mappedTokens,
  };
}

function buildWhatsAppUrl(
  rawNumber: string | null | undefined,
  locale: Locale
): string | null {
  if (!rawNumber) return null;
  const digits = rawNumber.replace(/\D/g, '');
  if (!digits) return null;
  const normalized = digits.startsWith('0')
    ? `62${digits.slice(1)}`
    : digits;
  const text =
    locale === 'id'
      ? 'Halo Faqih, saya baru melihat website portofolio Anda dan ingin berdiskusi.'
      : 'Hi Faqih, I just visited your portfolio website and would like to chat.';
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

/**
 * Default quick-prompt suggestions displayed in the chat widget.
 */
export function getDefaultSuggestions(locale: Locale): string[] {
  if (locale === 'id') {
    return [
      'Pernah bikin project apa aja?',
      'Layanan apa aja yang tersedia?',
      'Tech stack yang dipakai apa?',
      'Minta kontak WhatsApp Faqih dong',
    ];
  }

  return [
    'What projects have you built?',
    'What services do you offer?',
    'What tech stack do you use?',
    'How can I reach Faqih on WhatsApp?',
  ];
}

/**
 * Builds the system instruction for Groq / Gemini LLM grounded in live Supabase portfolio data.
 * Designed so the AI mirrors the visitor's exact tone, speaks like a natural human,
 * and strictly refuses any out-of-scope requests (Guardrails / Domain Restriction).
 */
export function buildPortfolioSystemPrompt(
  ctx: PortfolioChatContext,
  locale: Locale
): string {
  const brandName = ctx.settings.brand_name || 'Argandhi.';
  const title =
    pickLocalized(ctx.settings.hero_title, locale) || 'Software Developer';
  const aboutDesc = pickLocalized(ctx.settings.about_description, locale);
  const email = ctx.settings.contact_email || 'argandhi23@gmail.com';
  const whatsapp = ctx.settings.whatsapp_number || '6285806912873';
  const github = ctx.settings.github_url || 'https://github.com/Argandhi23';

  const servicesSummary = ctx.services
    .map((s) => `${s.number_label} ${pickLocalized(s.title, locale)}`)
    .join(', ');

  const brandsSummary = ctx.brands.map((b) => b.name).join(', ');

  const projectsSummary =
    ctx.projects.length > 0
      ? ctx.projects
          .map((p, idx) => {
            const pTitle = pickLocalized(p.title, locale);
            const pCat = pickLocalized(p.category, locale);
            const pSummary = pickLocalized(p.summary, locale);
            const stack =
              p.tech_stack && p.tech_stack.length > 0
                ? p.tech_stack.join(', ')
                : '-';
            const live = p.project_url ? ` | Live: ${p.project_url}` : '';
            const apk = p.apk_url ? ` | APK tersedia` : '';
            return `${idx + 1}. "${pTitle}" (slug: /projects/${p.slug}, kategori: ${pCat}, tech: ${stack})${live}${apk} — ${pSummary}`;
          })
          .join('\n')
      : 'Al Parfume (E-Commerce), Vetsy (Mobile APK Flutter), GriyaNesa (Web Kost UNESA), Desa Bogem (Web Desa), Sistem Paket Warga (Web Logistik Paket Perumahan), Prabaswara (Web Studio Fotografi), Sumberwangi (Katalog Parfum), FajarTrans (Web Rental Mobil).';

  return [
    `Kamu adalah asisten chat di website portofolio Faqih Rafasha Argandhi (brand: "${brandName}"), seorang ${title} di Surabaya.`,
    '',
    '=== ATURAN ANTI-NGARANG / ZERO HALLUCINATION (PALING PENTING & WAJIB DIPATUHI!) ===',
    '1. DILARANG KERAS MENGARANG INFORMASI YANG TIDAK TERTULIS DI DATA FAKTA DI BAWAH!',
    '   - Website ini TIDAK mencantumkan harga/biaya/tarif (jangan pernah menyebut angka seperti "3-5 juta", "jutaan", "Rp", atau paket harga apa pun!).',
    '   - Website ini TIDAK mencantumkan batas jumlah revisi (misal "revisi 2x"), lama waktu pengerjaan (berapa hari/minggu), atau syarat pembayaran.',
    '   - Website ini TIDAK mencantumkan umur, tanggal lahir, IPK, hobi, akun sosmed selain GitHub, atau pengalaman kerja selain yang tertulis di bawah.',
    '2. APA YANG HARUS DIJAWAB KALAU INFORMASINYA TIDAK ADA DI DATA?',
    '   - Kalau user menanyakan harga/biaya pembuatan web, waktu pengerjaan, paket revisi, atau hal tentang Faqih yang TIDAK tertulis di data bawah: JANGAN MENEBAK ATAU MENGARANG.',
    '   - Jawab dengan jujur dan santai/sopan bahwa informasi detail tersebut memang tidak dicantumkan di website karena menyesuaikan kebutuhan tiap project, lalu arahkan user untuk langsung chat ke WhatsApp Faqih (+' +
      whatsapp.replace(/\D/g, '') +
      ') atau isi form kontak di website supaya bisa ngobrol langsung sama Faqih.',
    '',
    '=== BATASAN TOPIK / GUARDRAILS ===',
    '1. Kamu HANYA BOLEH menjawab hal seputar website portofolio ini, profil/pendidikan Faqih, daftar project, tech stack, layanan, dan cara menghubungi Faqih.',
    '2. DILARANG KERAS membuatkan kode program (HTML, CSS, JS, Python, dll), menjawab tugas kuliah, matematika, resep, atau topik umum di luar portofolio Faqih. Tolak dengan ramah kalau diminta.',
    '',
    '=== ATURAN GAYA BAHASA ===',
    '1. IKUTI GAYA BAHASA PENANYA (Mirroring):',
    '   - Kalau user nanya santai/gaul (pakai "bro", "bang", "gimana", "gak", "bayar berapa", dll), balas dengan bahasa obrolan santai dan akrab seperti chat WhatsApp.',
    '   - Kalau user nanya sopan/formal, balas dengan ramah dan sopan.',
    '   - Kalau user nanya bahasa Inggris, balas pakai bahasa Inggris.',
    '2. Jawab singkat (1–3 kalimat mengalir). Jangan pernah membuat daftar paket/brosur karangan sendiri!',
    '',
    '=== SATU-SATUNYA FAKTA RESMI DI WEBSITE PORTOFOLIO INI ===',
    `- Nama Lengkap: Faqih Rafasha Argandhi`,
    `- Peran: ${title}`,
    `- Domisili: Surabaya, Jawa Timur (asal Madiun).`,
    `- Pendidikan Kuliah: Mahasiswa S1 Teknik Informatika di Universitas Negeri Surabaya (UNESA) angkatan 2024.`,
    `- Pendidikan Menengah: Alumni MAN 2 Kota Madiun (Kelas Keterampilan Desain Web).`,
    `- Program AI: Peserta AI Engineer Cohort di Program Asah (diselenggarakan oleh Dicoding & didukung GoTo) — fokus Python, Machine Learning, & Generative AI.`,
    `- Pengalaman Magang (PKL): Web Design & IT Intern di LPK Singosari, Malang (2 bulan).`,
    `- Tentang Faqih: ${aboutDesc}`,
    `- 4 Layanan yang Ditampilkan di Website: ${servicesSummary || '#01 Web Development, #02 Mobile App (APK), #03 AI Engineering, #04 UI/UX & Maintenance'}`,
    `- Tech Stack yang Ditampilkan di Website: ${brandsSummary || 'Next.js, Supabase, Shadcn UI, Tailwind CSS, Flutter, Firebase, React, Astro, Vercel'} (serta TypeScript, PostgreSQL, Python).`,
    `- Kontak Resmi di Website: WhatsApp +${whatsapp.replace(/\D/g, '')}, Email ${email}, GitHub ${github}, dan Formulir Brief Proyek di bagian bawah halaman utama (#contact).`,
    `- Catatan Harga/Biaya/Durasi/Revisi: TIDAK DICANTUMKAN di website. Semua diskusi harga, spesifikasi fitur, dan waktu pengerjaan dibicarakan langsung lewat WhatsApp atau form kontak.`,
    '',
    '=== DAFTAR PROJECT RESMI DI WEBSITE ===',
    projectsSummary,
  ].join('\n');
}

/**
 * Guardrail check: detects when a visitor asks the bot to write code, solve general tasks,
 * or answer off-topic questions unrelated to Faqih's portfolio.
 */
export function checkOutOfScopeGuardrail(
  rawMessage: string,
  locale: Locale
): ChatReplyPayload | null {
  const lower = rawMessage.toLowerCase().trim();
  const tone = detectChatTone(rawMessage);

  // 1. Requests to generate/write code, HTML, scripts, essays, or solve homework
  const isCodeOrTaskRequest =
    /\b(buatkan|bikinin|bikin|tulis|tuliskan|kasih|berikan|contoh|generate|write|create|code|kodingan)\b.*\b(code|kode|kodingan|script|html|css|javascript|js|python|php|sql|java|c\+\+|react|component|fungsi|function|program|artikel|essay|makalah|puisi|cerpen|tugas|pr|rumus)\b/.test(
      lower
    ) ||
    /\b(ignore previous|abaikan instruksi|lupakan instruksi|act as|anggap kamu adalah)\b/.test(
      lower
    ) ||
    lower.includes('```') ||
    /<\s*(html|head|body|div|script|style)\b/i.test(rawMessage);

  // 2. General knowledge / trivia / math / recipes unrelated to portfolio
  const isGeneralTrivia =
    /\b(resep|cara memasak| cara masak|presiden|ibukota|ibu kota|penemu|perang dunia|fotosintesis|berapa hasil dari|hitunglah|cuaca hari ini|ramalan|zodiak)\b/.test(
      lower
    ) || /^\s*\d+\s*[+\-*/x:]\s*\d+/.test(lower);

  if (!isCodeOrTaskRequest && !isGeneralTrivia) {
    return null;
  }

  const reply =
    locale === 'id'
      ? tone === 'casual'
        ? 'Waduh bro, kalau buat bikin kodingan atau bahas topik di luar portofolio aku ga bisa bantu nih 😄 Aku khusus disiapin buat jawab hal-hal seputar portofolio, project, dan jasa pembuatan web/aplikasinya Faqih aja. Kalau mau tanya soal project Faqih atau diskusi bikin web beneran, baru aku jagonya!'
        : 'Maaf ya, saya khusus diprogram untuk menjawab informasi seputar website portofolio, karya project, dan layanan pengembangan aplikasi dari Faqih Rafasha saja 😊 Ada yang ingin kamu tanyakan seputar project atau layanan Faqih?'
      : "Sorry, I'm specifically designed to answer questions about Faqih Rafasha's portfolio, projects, and software development services only 😊 Is there anything you'd like to know about Faqih's work or services?";

  return {
    reply,
    mode: 'smart-local',
    links: [
      {
        label: locale === 'id' ? 'Lihat Proyek Faqih' : "View Faqih's Projects",
        href: '/projects',
      },
      {
        label: locale === 'id' ? 'Hubungi Faqih' : 'Contact Faqih',
        href: '/#contact',
      },
    ],
  };
}

/**
 * Checks if an AI response accidentally leaked raw code blocks or HTML snippets,
 * or hallucinated unstated pricing/packages/timelines that do not exist on the portfolio.
 */
export function containsDisallowedCodeOutput(reply: string): boolean {
  if (reply.includes('```')) return true;
  if (/<\s*(!doctype|html|head|body|div|script|style|table|form)\b/i.test(reply)) {
    return true;
  }
  return false;
}

/**
 * Detects if the LLM hallucinated prices, currency amounts, revision limits, or weekly timelines
 * that are not listed on the website.
 */
export function containsHallucinatedPortfolioClaims(reply: string): boolean {
  const lower = reply.toLowerCase();
  if (
    /\b(\d+\s*[-–—]\s*\d+\s*(juta|jt|ribu|rb|minggu|hari|bulan)|\d+\s*(juta|jutaan|jt|ribu|rb)\b|rp\.?\s*\d|idr\s*\d|revisi\s*\d+|sampai\s*\d+\s*x|rajaongkir|midtrans|xendit|netlify)\b/i.test(
      lower
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Builds an honest, tone-matched response when the user asks about pricing, timelines,
 * or details not explicitly listed on the website.
 */
export function buildUnlistedInfoRedirectReply(
  rawMessage: string,
  ctx: PortfolioChatContext,
  locale: Locale
): ChatReplyPayload {
  const tone = detectChatTone(rawMessage);
  const waUrl = buildWhatsAppUrl(ctx.settings.whatsapp_number, locale);
  const phone = (ctx.settings.whatsapp_number || '6285806912873').replace(
    /\D/g,
    ''
  );
  const email = ctx.settings.contact_email || 'argandhi23@gmail.com';

  const reply =
    locale === 'id'
      ? tone === 'casual'
        ? `Kalau soal rincian biaya, lama pengerjaan, atau kesepakatan project memang nggak dicantumin di website ini bro, soalnya menyesuaikan sama kebutuhan fitur yang mau kamu buat 😄 Langsung aja chat Faqih di WhatsApp **+${phone}** atau lewat email **${email}** biar enak diobrolin langsung sama orangnya!`
        : `Untuk informasi mengenai harga/biaya, lama waktu pengerjaan, maupun detail kesepakatan project memang tidak dicantumkan di website ini karena menyesuaikan dengan kebutuhan spesifik tiap aplikasi 😊 Silakan langsung menghubungi Faqih lewat WhatsApp di **+${phone}** atau mengisi form kontak di bawah agar bisa berdiskusi langsung ya!`
      : `Details like project pricing, timelines, or custom arrangements aren't listed on the website since they depend on what you'd like to build 😊 Please message Faqih directly on WhatsApp at **+${phone}** or via the contact form below to discuss your project!`;

  return {
    reply,
    mode: 'smart-local',
    links: [
      ...(waUrl
        ? [
            {
              label: locale === 'id' ? 'Chat via WhatsApp' : 'Chat on WhatsApp',
              href: waUrl,
              external: true,
            },
          ]
        : []),
      {
        label: locale === 'id' ? 'Form Kontak' : 'Contact Form',
        href: '/#contact',
      },
    ],
  };
}

function findMatchingProject(
  cleanedQuery: string,
  projects: ProjectSummary[]
): ProjectSummary | null {
  const domainAliases: Record<string, string[]> = {
    alparfume: ['alparfume', 'al parfume', 'parfum', 'qris', 'toko online parfum'],
    vetsy: ['vetsy', 'klinik hewan', 'dokter hewan', 'vet', 'pet', 'hewan'],
    griyanesa: ['griyanesa', 'griya nesa', 'kost', 'kos', 'unesa 5', 'pencarian kost'],
    'desa-bogem': ['desa bogem', 'bogem', 'website desa', 'sistem informasi desa', 'surat desa'],
    fajartrans: ['fajartrans', 'fajar trans', 'rental mobil', 'sewa mobil', 'travel', 'armada'],
    sumberwangi: ['sumberwangi', 'sumber wangi', 'katalog parfum'],
    prabaswara: ['prabaswara', 'swara gallery', 'swara studio', 'swara moment', 'swara wedding', 'studio foto', 'fotografi'],
    'sistem-paket-warga': [
      'sistem paket warga',
      'paket warga',
      'sdpr',
      'distribusi paket',
      'logistik perumahan',
      'pos satpam',
      'project rpl',
    ],
  };

  for (const project of projects) {
    const slug = project.slug.toLowerCase();
    const titleEn = pickLocalized(project.title, 'en').toLowerCase();
    const titleId = pickLocalized(project.title, 'id').toLowerCase();
    const aliases = domainAliases[slug] ?? [];

    if (
      cleanedQuery.includes(slug) ||
      (titleEn.length >= 4 && cleanedQuery.includes(titleEn)) ||
      (titleId.length >= 4 && cleanedQuery.includes(titleId)) ||
      aliases.some((alias) => cleanedQuery.includes(alias))
    ) {
      return project;
    }
  }
  return null;
}

export function extractRelevantLinks(
  message: string,
  reply: string,
  ctx: PortfolioChatContext,
  locale: Locale
): ChatActionLink[] {
  const { cleaned } = normalizeAndTokenize(`${message} ${reply}`);
  const links: ChatActionLink[] = [];
  const seenHrefs = new Set<string>();

  const addLink = (link: ChatActionLink) => {
    if (!seenHrefs.has(link.href) && links.length < 3) {
      seenHrefs.add(link.href);
      links.push(link);
    }
  };

  const matchedProject = findMatchingProject(cleaned, ctx.projects);
  if (matchedProject) {
    const title = pickLocalized(matchedProject.title, locale);
    addLink({
      label: locale === 'id' ? `Studi Kasus ${title}` : `${title} Case Study`,
      href: `/projects/${matchedProject.slug}`,
    });
    if (matchedProject.project_url) {
      addLink({
        label: locale === 'id' ? `Buka Live ${title}` : `Live Demo: ${title}`,
        href: matchedProject.project_url,
        external: true,
      });
    }
  }

  if (
    links.length === 0 &&
    /\b(proyek|karya|work|showcase|studi kasus)\b/.test(cleaned)
  ) {
    addLink({
      label: locale === 'id' ? 'Lihat Semua Proyek' : 'Explore All Projects',
      href: '/projects',
    });
  }

  if (
    /\b(tentang|profil|unesa|pendidikan|education|asah|dicoding|perjalanan|magang)\b/.test(
      cleaned
    )
  ) {
    addLink({
      label: locale === 'id' ? 'Profil Lengkap' : 'Full Profile',
      href: '/about',
    });
  }

  if (
    /\b(contact|kontak|hubungi|whatsapp|email|hire|kerjasama|harga|pesan|order|diskusi)\b/.test(
      cleaned
    )
  ) {
    const waUrl = buildWhatsAppUrl(ctx.settings.whatsapp_number, locale);
    if (waUrl) {
      addLink({
        label: locale === 'id' ? 'Chat via WhatsApp' : 'Chat on WhatsApp',
        href: waUrl,
        external: true,
      });
    }
    addLink({
      label: locale === 'id' ? 'Kirim Brief Proyek' : 'Send Project Brief',
      href: '/#contact',
    });
  }

  return links;
}

interface IntentRule {
  id: string;
  keywords: string[];
  phrases: string[];
  buildReply: (
    ctx: PortfolioChatContext,
    locale: Locale,
    tone: ChatTone,
    rawQuery: string
  ) => ChatReplyPayload;
}

function scoreIntent(
  rawCleaned: string,
  cleaned: string,
  tokens: string[],
  rule: IntentRule
): number {
  let score = 0;

  for (const phrase of rule.phrases) {
    if (cleaned.includes(phrase) || rawCleaned.includes(phrase)) {
      score += 4.5;
    }
  }

  const tokenSet = new Set(tokens);
  for (const kw of rule.keywords) {
    if (tokenSet.has(kw)) {
      score += 2.0;
    } else if (
      kw.length >= 4 &&
      (cleaned.includes(kw) || rawCleaned.includes(kw))
    ) {
      score += 1.2;
    }
  }

  return score;
}

const INTENT_KNOWLEDGE_BASE: IntentRule[] = [
  // 1. Small talk: How are you / Lagi ngapain
  {
    id: 'smalltalk-status',
    phrases: [
      'apa kabar',
      'how are you',
      'gimana kabarnya',
      'lagi ngapain',
      'lagi apa',
      'sibuk ga',
    ],
    keywords: ['kabar', 'kabarnya', 'sehat', 'ngapain'],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Kabar baik bro! Lagi standby aja nih bantuin yang mampir ke web Faqih 😄 Kamu sendiri gimana, lagi cari inspirasi project atau mau bikin web/aplikasi?'
            : 'Kabar baik, terima kasih sudah menyapa! 😊 Saat ini saya siap bantu jawab kalau ada yang ingin kamu tanyakan seputar Faqih atau pembuatan web/aplikasi.'
          : "I'm doing great, thanks for asking! 😊 How about you—exploring Faqih's work or thinking of building an app?",
      mode: 'smart-local',
    }),
  },

  // 2. Small talk: Bot identity
  {
    id: 'bot-identity',
    phrases: [
      'siapa kamu',
      'kamu siapa',
      'apakah kamu ai',
      'kamu bot',
      'who are you',
      'are you a bot',
    ],
    keywords: ['asisten', 'bot', 'chatbot', 'robot'],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Aku asisten virtualnya Faqih di web ini! Jadi kalau kamu mau tanya-tanya soal project dia, skill kodingnya, atau mau diskusi bikin web/aplikasi, tanya aja santai ke aku.'
            : 'Saya asisten virtual di portofolio Faqih Rafasha. Kamu bisa tanya-tanya santai ke saya soal karya project Faqih, layanan pembuatan web/aplikasi, atau cara menghubunginya.'
          : "I'm Faqih's portfolio assistant! Feel free to ask me anything about his projects, tech stack, or how to work together.",
      mode: 'smart-local',
    }),
  },

  // 3. Gratitude / Praise / Closing
  {
    id: 'gratitude',
    phrases: [
      'terima kasih',
      'thank you',
      'makasih banyak',
      'keren banget',
      'webnya keren',
      'desainnya bagus',
    ],
    keywords: ['terimakasih', 'mantap', 'keren', 'bagus', 'oke', 'siap', 'cakep'],
    buildReply: (ctx, locale, tone) => {
      const waUrl = buildWhatsAppUrl(ctx.settings.whatsapp_number, locale);
      return {
        reply:
          locale === 'id'
            ? tone === 'casual'
              ? 'Wah makasih banyak bro! 🙌 Kalau ada lagi yang bikin penasaran atau mau langsung ngobrol sama Faqih di WA, tinggal klik tombol di bawah aja ya.'
              : 'Terima kasih banyak! Senang mendengarnya 🙌 Kalau nanti ingin ngobrol langsung dengan Faqih, silakan hubungi lewat WhatsApp kapan saja ya.'
            : "Thanks so much! 🙌 If you'd ever like to chat directly with Faqih, feel free to jump on WhatsApp anytime.",
        mode: 'smart-local',
        links: waUrl
          ? [
              {
                label: locale === 'id' ? 'Chat via WhatsApp' : 'Chat on WhatsApp',
                href: waUrl,
                external: true,
              },
            ]
          : undefined,
      };
    },
  },

  // 4. Project Duration / Timeline / How long to build (Not listed on website -> redirect to chat)
  {
    id: 'timeline-duration',
    phrases: [
      'berapa lama',
      'berapa durasi',
      'berapa hari',
      'berapa minggu',
      'estimasi waktu',
      'estimasi durasi',
      'lama pengerjaan',
      'how long',
      'turnaround time',
    ],
    keywords: ['durasi', 'minggu', 'hari', 'bulan', 'deadline', 'selesai'],
    buildReply: (ctx, locale, _tone, rawQuery) =>
      buildUnlistedInfoRedirectReply(rawQuery, ctx, locale),
  },

  // 5. Revisions, Maintenance, & Unlisted Package Terms
  {
    id: 'revisions-maintenance',
    phrases: [
      'apakah ada revisi',
      'bisa revisi',
      'garansi',
      'after sales',
    ],
    keywords: ['revisi', 'garansi'],
    buildReply: (ctx, locale, _tone, rawQuery) =>
      buildUnlistedInfoRedirectReply(rawQuery, ctx, locale),
  },

  // 6. Pricing / Cost / Budget (Not listed on website -> redirect to chat)
  {
    id: 'pricing-cost',
    phrases: [
      'berapa harga',
      'berapa biaya',
      'kisaran harga',
      'daftar harga',
      'price list',
      'how much',
      'berapa duit',
      'bayar berapa',
    ],
    keywords: ['harga', 'murah', 'mahal', 'bayar', 'dp', 'cicil', 'fee'],
    buildReply: (ctx, locale, _tone, rawQuery) =>
      buildUnlistedInfoRedirectReply(rawQuery, ctx, locale),
  },

  // 7. Mobile App / Flutter / Android APK
  {
    id: 'mobile-apk-flutter',
    phrases: [
      'aplikasi android',
      'buat apk',
      'aplikasi mobile',
      'mobile app',
      'flutter apk',
    ],
    keywords: ['apk', 'android', 'flutter', 'mobile', 'ios', 'playstore'],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Bisa banget! Faqih biasa bikin aplikasi Android (`.apk`) pakai Flutter yang disambungin ke Firebase atau Supabase. Contohnya project **Vetsy**, aplikasi booking klinik dokter hewan yang udah lengkap sama jadwal real-time dan rekam medis.'
            : 'Ya, Faqih bisa membuat aplikasi Android (file `.apk`) menggunakan Flutter dengan backend Firebase atau Supabase. Salah satu contoh karyanya adalah aplikasi **Vetsy** untuk reservasi klinik hewan.'
          : 'Yes! Faqih builds Android mobile apps (`.apk`) using Flutter and Firebase/Supabase—like **Vetsy**, a veterinary clinic booking app.',
      mode: 'smart-local',
      links: [
        {
          label: locale === 'id' ? 'Lihat Project Vetsy' : 'View Vetsy Project',
          href: '/projects/vetsy',
        },
      ],
    }),
  },

  // 8. E-Commerce / Online Store / QRIS / Shipping
  {
    id: 'ecommerce-store',
    phrases: [
      'toko online',
      'e commerce',
      'ecommerce',
      'cek ongkir',
      'pembayaran qris',
      'website jualan',
      'web jualan',
    ],
    keywords: ['toko', 'jualan', 'ecommerce', 'ongkir', 'qris', 'checkout', 'katalog', 'baju'],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Bisa banget bikin web jualan / toko online! Faqih udah pernah garap **Al Parfume** (`alparfume.store`) yang fiturnya lengkap ada cek ongkir otomatis se-Indonesia, bayar pakai QRIS, sampai dashboard admin buat pantau stok & pesanan.'
            : 'Faqih sering menangani pembuatan website toko online (E-Commerce) maupun katalog produk. Contoh nyatanya adalah **Al Parfume** yang sudah dilengkapi hitung ongkir otomatis, pembayaran QRIS, dan dashboard stok untuk admin.'
          : 'Faqih builds custom e-commerce stores like **Al Parfume** (`alparfume.store`), complete with automated shipping calculations, QRIS payment, and an inventory admin dashboard.',
      mode: 'smart-local',
      links: [
        {
          label: locale === 'id' ? 'Studi Kasus Al Parfume' : 'Al Parfume Case Study',
          href: '/projects/alparfume',
        },
        {
          label: locale === 'id' ? 'Buka alparfume.store' : 'Visit alparfume.store',
          href: 'https://www.alparfume.store',
          external: true,
        },
      ],
    }),
  },

  // 9. Education / UNESA / Asah AI Cohort / Internship
  {
    id: 'education-journey',
    phrases: [
      'kuliah di mana',
      'mahasiswa mana',
      'angkatan berapa',
      'semester berapa',
      'program asah',
      'dicoding',
      'pengalaman magang',
      'jurusan apa',
    ],
    keywords: [
      'pendidikan',
      'unesa',
      'informatika',
      'asah',
      'dicoding',
      'goto',
      'magang',
      'singosari',
      'madiun',
      'angkatan',
      'semester',
      'mahasiswa',
      'student',
      'education',
    ],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Faqih sekarang kuliah S1 Teknik Informatika di **UNESA (Universitas Negeri Surabaya)** angkatan 2024, dulunya alumni MAN 2 Kota Madiun. Selain kuliah & garap project freelance, dia juga lagi aktif jadi peserta **AI Engineer Cohort di Program Asah (Dicoding & GoTo)**!'
            : 'Faqih saat ini menempuh kuliah S1 Teknik Informatika di **Universitas Negeri Surabaya (UNESA)** angkatan 2024 dan merupakan alumni MAN 2 Kota Madiun. Saat ini ia juga aktif sebagai peserta **Cohort AI Engineer di Program Asah (Dicoding & GoTo)**.'
          : 'Faqih is studying Informatics Engineering (B.Sc.) at Universitas Negeri Surabaya (UNESA, Cohort 2024) and is currently an AI Engineer Cohort participant in the Asah Program by Dicoding & GoTo.',
      mode: 'smart-local',
      links: [
        {
          label: locale === 'id' ? 'Profil Lengkap' : 'Full Profile',
          href: '/about',
        },
      ],
    }),
  },

  // 10. Location / Surabaya / Remote work
  {
    id: 'location-availability',
    phrases: [
      'tinggal di mana',
      'lokasi di mana',
      'orang mana',
      'bisa remote',
      'ketemuan',
      'where are you based',
    ],
    keywords: ['lokasi', 'surabaya', 'jawa', 'remote', 'offline', 'online', 'ketemu', 'base'],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Sekarang Faqih domisili di **Surabaya** (aslinya dari Madiun). Kalau mau garap project bareng bisa full remote dari mana aja, atau kalau kamu kebetulan di Surabaya bisa juga ngobrol langsung!'
            : 'Faqih saat ini berdomisili di **Surabaya, Jawa Timur** (asal Madiun). Untuk pengerjaan project sangat fleksibel, bisa dilakukan secara remote dari kota mana saja maupun diskusi langsung di area Surabaya.'
          : 'Faqih is based in Surabaya, East Java (originally from Madiun) and works with clients both remotely and locally.',
      mode: 'smart-local',
    }),
  },

  // 11. GitHub / Social links
  {
    id: 'github-socials',
    phrases: ['link github', 'akun github', 'source code', 'repo github'],
    keywords: ['github', 'git', 'repo', 'repository', 'kode', 'sosmed', 'linkedin'],
    buildReply: (ctx, locale) => {
      const githubUrl =
        ctx.settings.github_url || 'https://github.com/Argandhi23';
      return {
        reply:
          locale === 'id'
            ? `Kamu bisa cek langsung repositori dan kodingan Faqih di GitHub **${githubUrl}** ya!`
            : `You can check out Faqih's repositories on GitHub at **${githubUrl}**!`,
        mode: 'smart-local',
        links: [
          {
            label: 'GitHub (@Argandhi23)',
            href: githubUrl,
            external: true,
          },
        ],
      };
    },
  },

  // 12. Contact / WhatsApp / Email / Hire
  {
    id: 'contact-hire',
    phrases: [
      'cara hubungi',
      'nomor whatsapp',
      'minta nomor',
      'minta kontak',
      'cara pesan',
      'cara order',
      'kerja sama',
      'ingin buat web',
      'mau bikin web',
    ],
    keywords: [
      'hubungi',
      'whatsapp',
      'email',
      'nomor',
      'telepon',
      'hire',
      'kerjasama',
      'order',
      'pesan',
      'diskusi',
      'contact',
    ],
    buildReply: (ctx, locale, tone) => {
      const waUrl = buildWhatsAppUrl(ctx.settings.whatsapp_number, locale);
      const email = ctx.settings.contact_email || 'argandhi23@gmail.com';
      const phone = (ctx.settings.whatsapp_number || '6285806912873').replace(
        /\D/g,
        ''
      );
      return {
        reply:
          locale === 'id'
            ? tone === 'casual'
              ? `Kalau mau fast response langsung aja chat ke WhatsApp Faqih di **+${phone}** atau klik tombol WA di bawah ini bro! Bisa juga lewat email ke **${email}**.`
              : `Untuk respons paling cepat, kamu bisa langsung menghubungi Faqih lewat WhatsApp di **+${phone}**, email ke **${email}**, atau mengisi form singkat di bagian bawah halaman ini.`
            : `For the fastest response, you can message Faqih directly on WhatsApp at **+${phone}**, email **${email}**, or use the contact form below.`,
        mode: 'smart-local',
        links: [
          ...(waUrl
            ? [
                {
                  label: locale === 'id' ? 'Chat via WhatsApp' : 'Chat on WhatsApp',
                  href: waUrl,
                  external: true,
                },
              ]
            : []),
          {
            label: locale === 'id' ? 'Form Kontak' : 'Contact Form',
            href: '/#contact',
          },
        ],
      };
    },
  },

  // 13. Projects / Portfolio Showcase
  {
    id: 'projects-overview',
    phrases: [
      'project apa saja',
      'proyek apa saja',
      'pernah buat apa',
      'pernah bikin apa',
      'contoh project',
      'hasil karya',
      'what projects',
    ],
    keywords: ['proyek', 'karya', 'showcase', 'studi', 'kasus', 'contoh', 'portofolio'],
    buildReply: (ctx, locale, tone) => {
      const names =
        ctx.projects.length > 0
          ? ctx.projects
              .slice(0, 6)
              .map((p) => `**${pickLocalized(p.title, locale)}** (${pickLocalized(p.category, locale)})`)
              .join(', ')
          : '**Al Parfume** (E-Commerce), **Vetsy** (Aplikasi APK Klinik Hewan), **GriyaNesa** (Web Pencarian Kost UNESA), **Desa Bogem** (Web Desa), **Prabaswara** (Web Studio Fotografi), **Sumberwangi**, dan **FajarTrans** (Web Rental Mobil)';

      return {
        reply:
          locale === 'id'
            ? tone === 'casual'
              ? `Sejauh ini udah ada beberapa project live yang digarap Faqih, mulai dari ${names}. Kamu paling penasaran lihat yang mana nih?`
              : `Beberapa project utama yang sudah dibangun Faqih antara lain ${names}. Kamu bisa sebutkan nama salah satu project tersebut kalau ingin tahu detailnya, atau klik tombol di bawah untuk melihat semuanya.`
            : `Faqih has built several live projects including ${names}. Ask me about any of them or browse the full showcase below!`,
        mode: 'smart-local',
        links: [
          {
            label: locale === 'id' ? 'Lihat Semua Proyek' : 'View All Projects',
            href: '/projects',
          },
        ],
      };
    },
  },

  // 14. Services Offered
  {
    id: 'services-offered',
    phrases: [
      'layanan apa',
      'jasa apa',
      'bisa buat apa',
      'bisa bikin apa',
      'what services',
      'keahlian utama',
    ],
    keywords: ['layanan', 'jasa', 'service', 'services', 'bantu', 'spesialis'],
    buildReply: (ctx, locale, tone) => {
      const serviceNames = ctx.services
        .map((s) => `${s.number_label} ${pickLocalized(s.title, locale)}`)
        .join(', ');

      return {
        reply:
          locale === 'id'
            ? tone === 'casual'
              ? `Fokus utamanya ada 4 bro: **${serviceNames}**. Jadi mulai dari bikin website company profile, toko online full-stack, aplikasi Android APK pakai Flutter, sampai integrasi AI semuanya bisa digarap.`
              : `Faqih melayani 4 bidang utama: **${serviceNames}** — mulai dari pembuatan website bisnis/toko online, aplikasi mobile Android (APK), sistem AI, hingga perancangan UI/UX dan pemeliharaan.`
            : `Faqih offers 4 core services: **${serviceNames}**—covering custom web apps, Flutter Android APKs, AI integration, and UI/UX maintenance.`,
        mode: 'smart-local',
        links: [
          {
            label: locale === 'id' ? 'Diskusikan Proyek' : 'Start a Project',
            href: '/#contact',
          },
        ],
      };
    },
  },

  // 15. Tech Stack / Programming Languages
  {
    id: 'tech-stack',
    phrases: [
      'tech stack',
      'bahasa pemrograman',
      'pakai framework apa',
      'pakai database apa',
      'what tech',
    ],
    keywords: [
      'tech',
      'teknologi',
      'keahlian',
      'nextjs',
      'react',
      'supabase',
      'postgresql',
      'typescript',
      'tailwind',
      'python',
      'astro',
      'firebase',
    ],
    buildReply: (ctx, locale, tone) => {
      const brandNames = ctx.brands.map((b) => b.name).join(', ');
      return {
        reply:
          locale === 'id'
            ? tone === 'casual'
              ? `Sehari-hari Faqih paling sering ngoding pakai **Next.js, TypeScript, Tailwind CSS, dan Supabase (PostgreSQL)** buat web. Kalau buat aplikasi mobile Android dia pakai **Flutter & Firebase**, sedangkan buat AI pakai **Python** (${brandNames}).`
              : `Untuk pembuatan web, Faqih menggunakan **Next.js, TypeScript, React, Astro, Tailwind CSS, dan Supabase (PostgreSQL)**. Untuk aplikasi mobile Android menggunakan **Flutter & Firebase**, serta **Python** untuk kebutuhan AI (${brandNames}).`
            : `Faqih works primarily with **Next.js, TypeScript, Tailwind CSS, and Supabase (PostgreSQL)** for web, **Flutter & Firebase** for mobile APKs, and **Python** for AI engineering (${brandNames}).`,
        mode: 'smart-local',
        links: [
          {
            label: locale === 'id' ? 'Lihat Profil & Stack' : 'Profile & Stack',
            href: '/about',
          },
        ],
      };
    },
  },

  // 16. About Faqih / General Bio
  {
    id: 'about-faqih',
    phrases: [
      'siapa faqih',
      'siapa argandhi',
      'tentang faqih',
      'latar belakang',
      'profil faqih',
      'who is faqih',
    ],
    keywords: ['siapa', 'tentang', 'profil', 'biodata', 'faqih', 'argandhi', 'perkenalkan', 'about'],
    buildReply: (_ctx, locale, tone) => ({
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Faqih Rafasha Argandhi itu Full-Stack & Software Developer yang domisili di Surabaya. Sekarang dia kuliah S1 Teknik Informatika di UNESA (\'24), ikut cohort AI Engineer di program Asah (Dicoding & GoTo), sambil aktif garap berbagai project web & aplikasi mobile!'
            : 'Faqih Rafasha Argandhi adalah seorang Full-Stack & Software Developer di Surabaya. Selain berkuliah di S1 Teknik Informatika UNESA (\'24) dan mengikuti program AI Engineer Asah (Dicoding & GoTo), ia aktif membangun website serta aplikasi mobile untuk berbagai kebutuhan klien.'
          : "Faqih Rafasha Argandhi is a Full-Stack & Software Developer based in Surabaya, studying Informatics Engineering at UNESA ('24) and participating in the Asah AI Engineer Cohort while building production web and mobile apps.",
      mode: 'smart-local',
      links: [
        {
          label: locale === 'id' ? 'Baca Profil Lengkap' : 'Read Full Bio',
          href: '/about',
        },
      ],
    }),
  },
];

/**
 * Generates a natural, tone-aware response directly from cached Supabase portfolio data.
 */
export function generateSmartLocalReply(
  rawMessage: string,
  ctx: PortfolioChatContext,
  locale: Locale
): ChatReplyPayload {
  // 0. Guardrail check: immediately refuse code generation or off-topic requests
  const guardrailBlocked = checkOutOfScopeGuardrail(rawMessage, locale);
  if (guardrailBlocked) {
    return guardrailBlocked;
  }

  const { rawCleaned, cleaned, tokens } = normalizeAndTokenize(rawMessage);
  const tone = detectChatTone(rawMessage);
  const waUrl = buildWhatsAppUrl(ctx.settings.whatsapp_number, locale);

  // 1. Specific project match
  const matchedProject = findMatchingProject(cleaned, ctx.projects);
  if (matchedProject) {
    const title = pickLocalized(matchedProject.title, locale);
    const category = pickLocalized(matchedProject.category, locale);
    const summary =
      pickLocalized(matchedProject.summary, locale) ||
      (locale === 'id'
        ? 'Proyek produksi yang dibangun dengan arsitektur modern dan performa tinggi.'
        : 'Production project engineered for speed, reliability, and clean UX.');
    const stack =
      matchedProject.tech_stack && matchedProject.tech_stack.length > 0
        ? matchedProject.tech_stack.join(', ')
        : 'Next.js, TypeScript, Tailwind CSS';

    const reply =
      locale === 'id'
        ? tone === 'casual'
          ? `Oh **${title}** itu project ${category} garapan Faqih! ${summary} Project ini dibangun pakai ${stack}${matchedProject.project_url ? ` dan bisa kamu coba langsung di ${matchedProject.project_url}` : ''}.`
          : `**${title}** adalah project kategori ${category} yang dikerjakan Faqih. ${summary} Aplikasi ini dibangun menggunakan ${stack}${matchedProject.project_url ? ` dan aktif di ${matchedProject.project_url}` : ''}.`
        : `**${title}** is a ${category} project built by Faqih. ${summary} Built with ${stack}${matchedProject.project_url ? ` (${matchedProject.project_url})` : ''}.`;

    const links: ChatActionLink[] = [
      {
        label: locale === 'id' ? `Studi Kasus ${title}` : `${title} Case Study`,
        href: `/projects/${matchedProject.slug}`,
      },
    ];
    if (matchedProject.project_url) {
      links.push({
        label: locale === 'id' ? `Buka Live ${title}` : `Visit ${title}`,
        href: matchedProject.project_url,
        external: true,
      });
    }

    return {
      reply,
      mode: 'smart-local',
      links,
    };
  }

  // 2. Score intents in the Knowledge Base
  let bestRule: IntentRule | null = null;
  let bestScore = 0;

  for (const rule of INTENT_KNOWLEDGE_BASE) {
    const score = scoreIntent(rawCleaned, cleaned, tokens, rule);
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  if (bestRule && bestScore >= 1.2) {
    return bestRule.buildReply(ctx, locale, tone, rawMessage);
  }

  // 3. Greeting check
  if (
    /\b(halo|hai|hi|hello|hey|pagi|siang|sore|malam|assalamualaikum|permisi|p|tes|test|woi|bro|bang)\b/.test(
      rawCleaned
    )
  ) {
    return {
      reply:
        locale === 'id'
          ? tone === 'casual'
            ? 'Halo bro! 👋 Lagi lihat-lihat portofolio Faqih ya? Kalau mau tanya soal project, pembuatan web/aplikasi, atau kontak WA-nya, ketik aja santai di sini!'
            : 'Halo! 👋 Selamat datang di portofolio Faqih Rafasha. Ada yang ingin kamu tanyakan seputar project, pembuatan website/aplikasi, atau cara berdiskusi langsung?'
          : "Hey there! 👋 Welcome to Faqih Rafasha's portfolio. Feel free to ask anything about his projects, web/mobile development, or how to get in touch!",
      mode: 'smart-local',
    };
  }

  // 4. Conversational fallback
  return {
    reply:
      locale === 'id'
        ? tone === 'casual'
          ? 'Wah kalau buat bahas itu lebih enak ngobrol langsung sama orangnya nih bro 😄 Kamu bisa langsung klik tombol WhatsApp di bawah buat chat sama Faqih, atau kalau mau tanya seputar project & pembuatan web di sini juga boleh banget!'
          : 'Untuk hal tersebut, paling pas kalau didiskusikan langsung bersama Faqih lewat WhatsApp supaya penjelasannya lebih lengkap 😊 Tapi kalau kamu ingin tanya seputar project, tech stack, atau layanan web/APK, silakan tanya saja di sini!'
        : "That's best discussed directly with Faqih on WhatsApp so he can give you a complete answer! 😊 Or feel free to ask me anything about his projects, services, or tech stack right here.",
    mode: 'smart-local',
    links: waUrl
      ? [
          {
            label: locale === 'id' ? 'Chat Faqih di WA' : 'Message Faqih on WA',
            href: waUrl,
            external: true,
          },
        ]
      : undefined,
  };
}
