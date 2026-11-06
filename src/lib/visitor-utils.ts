import type { DeviceType, PageView } from '@/types/database.types';

export interface ParsedUserAgent {
  isBot: boolean;
  deviceType: DeviceType;
  browser: string;
  os: string;
}

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|mediapartners|adsbot|lighthouse|headlesschrome|playwright|puppeteer|phantomjs|curl|wget|python-requests|axios|go-http-client|uptime|pingdom|gtmetrix|facebookexternalhit|whatsapp|discordbot|telegrambot|twitterbot|linkedinbot/i;

/**
 * Parses a standard HTTP User-Agent string into clean device, browser, and OS labels,
 * while flagging automated bots/crawlers so they don't pollute visitor stats.
 */
export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  const ua = (userAgent || '').trim();
  if (!ua) {
    return {
      isBot: true,
      deviceType: 'Desktop',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  const isBot = BOT_PATTERN.test(ua);

  // Device Type
  let deviceType: DeviceType = 'Desktop';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (
    /Mobile|iP(hone|od)|Android.*Mobile|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    deviceType = 'Mobile';
  }

  // Browser
  let browser = 'Browser';
  if (/EdgA?\//i.test(ua)) {
    browser = 'Edge';
  } else if (/OPR\/|Opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Chrome\/|CriOS\//i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Firefox\/|FxiOS\//i.test(ua)) {
    browser = 'Firefox';
  } else if (/Safari\//i.test(ua) && !/Chrome|CriOS|Android/i.test(ua)) {
    browser = 'Safari';
  }

  // OS
  let os = 'OS';
  if (/Windows NT/i.test(ua)) {
    os = 'Windows';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
  } else if (/Mac OS X|Macintosh/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  return { isBot, deviceType, browser, os };
}

/**
 * Normalizes a raw HTTP Referer URL into a friendly traffic source name.
 */
export function normalizeReferrerSource(
  referrer: string | null | undefined,
  currentHost?: string | null
): string {
  const raw = (referrer || '').trim();
  if (!raw) return 'Direct';

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (currentHost) {
      const cleanCurrent = currentHost
        .toLowerCase()
        .replace(/^www\./, '')
        .split(':')[0];
      if (host === cleanCurrent || host === 'localhost' || host === '127.0.0.1') {
        return 'Direct';
      }
    } else if (host === 'localhost' || host === '127.0.0.1') {
      return 'Direct';
    }

    if (host.includes('instagram.com') || host === 'l.instagram.com') {
      return 'Instagram';
    }
    if (host.includes('linkedin.com') || host === 'lnkd.in') {
      return 'LinkedIn';
    }
    if (host.includes('github.com')) {
      return 'GitHub';
    }
    if (host.includes('google.')) {
      return 'Google';
    }
    if (host.includes('whatsapp.com') || host.includes('wa.me')) {
      return 'WhatsApp';
    }
    if (host.includes('twitter.com') || host.includes('x.com') || host === 't.co') {
      return 'X / Twitter';
    }
    if (host.includes('facebook.com') || host.includes('fb.com') || host === 'm.facebook.com') {
      return 'Facebook';
    }
    if (host.includes('tiktok.com')) {
      return 'TikTok';
    }
    if (host.includes('youtube.com') || host === 'youtu.be') {
      return 'YouTube';
    }
    if (host.includes('bing.com')) {
      return 'Bing';
    }
    if (host.includes('dicoding.com')) {
      return 'Dicoding';
    }

    return host.slice(0, 80);
  } catch {
    return 'Direct';
  }
}

const TIMEZONE_LOCATION_MAP: Record<string, { city: string; country: string }> = {
  'Asia/Jakarta': { city: 'WIB (Jawa/Sumatera)', country: 'ID' },
  'Asia/Pontianak': { city: 'WIB (Kalimantan)', country: 'ID' },
  'Asia/Makassar': { city: 'WITA (Bali/Sulawesi)', country: 'ID' },
  'Asia/Jayapura': { city: 'WIT (Papua/Maluku)', country: 'ID' },
  'Asia/Singapore': { city: 'Singapore', country: 'SG' },
  'Asia/Kuala_Lumpur': { city: 'Kuala Lumpur', country: 'MY' },
  'Asia/Tokyo': { city: 'Tokyo', country: 'JP' },
  'Asia/Seoul': { city: 'Seoul', country: 'KR' },
  'Australia/Sydney': { city: 'Sydney', country: 'AU' },
  'Europe/London': { city: 'London', country: 'GB' },
  'America/New_York': { city: 'New York', country: 'US' },
  'America/Los_Angeles': { city: 'Los Angeles', country: 'US' },
};

/**
 * Infers visitor city and country from edge CDN geo headers (Vercel / Cloudflare)
 * with a clean fallback to client IANA timezone when geo headers are absent.
 */
export function inferLocation(
  geoHeaders: { country?: string | null; city?: string | null },
  timezone?: string | null
): { country: string | null; city: string | null } {
  const headerCountry = geoHeaders.country?.trim() || null;
  let headerCity: string | null = null;
  if (geoHeaders.city) {
    try {
      headerCity = decodeURIComponent(geoHeaders.city.trim());
    } catch {
      headerCity = geoHeaders.city.trim();
    }
  }

  if (headerCountry || headerCity) {
    return {
      country: headerCountry ? headerCountry.slice(0, 80) : null,
      city: headerCity ? headerCity.slice(0, 120) : null,
    };
  }

  const tz = (timezone || '').trim();
  if (tz && TIMEZONE_LOCATION_MAP[tz]) {
    return TIMEZONE_LOCATION_MAP[tz];
  }

  if (tz.includes('/')) {
    const parts = tz.split('/');
    const cityPart = parts[parts.length - 1]?.replace(/_/g, ' ') || null;
    return {
      country: parts[0] || null,
      city: cityPart,
    };
  }

  return { country: null, city: null };
}

export interface PeriodMetric {
  views: number;
  unique: number;
}

export interface VisitorAnalyticsSummary {
  today: PeriodMetric;
  thisWeek: PeriodMetric;
  thisMonth: PeriodMetric;
  thisYear: PeriodMetric;
  allTime: PeriodMetric;
  topSources: Array<{ source: string; count: number }>;
  topPages: Array<{ path: string; count: number }>;
}

/**
 * Computes Today, This Week, This Month, This Year, and All-Time pageview & unique
 * visitor metrics from a list of page_views rows.
 */
export function computeVisitorAnalytics(
  rows: PageView[],
  now: Date = new Date()
): VisitorAnalyticsSummary {
  // Start of today (local/server date boundary)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of this week (Monday as first day of week)
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diffToMonday
  );

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Start of this year
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const todaySet = new Set<string>();
  const weekSet = new Set<string>();
  const monthSet = new Set<string>();
  const yearSet = new Set<string>();
  const allSet = new Set<string>();

  let todayViews = 0;
  let weekViews = 0;
  let monthViews = 0;
  let yearViews = 0;

  const sourceCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();

  for (const row of rows) {
    const ts = new Date(row.created_at).getTime();
    const vid = row.visitor_id;

    allSet.add(vid);

    if (ts >= startOfYear.getTime()) {
      yearViews++;
      yearSet.add(vid);
    }
    if (ts >= startOfMonth.getTime()) {
      monthViews++;
      monthSet.add(vid);
    }
    if (ts >= startOfWeek.getTime()) {
      weekViews++;
      weekSet.add(vid);
    }
    if (ts >= startOfToday.getTime()) {
      todayViews++;
      todaySet.add(vid);
    }

    const src = row.referrer_source || 'Direct';
    sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);

    const p = row.path || '/';
    pageCounts.set(p, (pageCounts.get(p) ?? 0) + 1);
  }

  const topSources = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topPages = Array.from(pageCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    today: { views: todayViews, unique: todaySet.size },
    thisWeek: { views: weekViews, unique: weekSet.size },
    thisMonth: { views: monthViews, unique: monthSet.size },
    thisYear: { views: yearViews, unique: yearSet.size },
    allTime: { views: rows.length, unique: allSet.size },
    topSources,
    topPages,
  };
}
