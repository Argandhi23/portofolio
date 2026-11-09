export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

// Accept a deliberately static SVG subset. No scripts, animation, hyperlinks,
// embedded documents, external resources, XML entities, or CSS imports.
const STATIC_SVG_TAGS = new Set([
  'svg', 'g', 'defs', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
  'polygon', 'text', 'tspan', 'title', 'desc', 'linearGradient', 'radialGradient',
  'stop', 'clipPath', 'mask', 'pattern', 'symbol', 'use',
].map((tag) => tag.toLowerCase()));

const STATIC_SVG_ATTRIBUTES = new Set([
  'id', 'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'transform', 'preserveAspectRatio',
  'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray',
  'stroke-dashoffset', 'opacity', 'clip-path', 'clip-rule', 'mask',
  'gradientUnits', 'gradientTransform', 'spreadMethod', 'offset', 'stop-color',
  'stop-opacity', 'fx', 'fy', 'fr', 'patternUnits', 'patternContentUnits',
  'patternTransform', 'clipPathUnits', 'maskUnits', 'maskContentUnits',
  'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
  'dx', 'dy', 'rotate', 'textLength', 'lengthAdjust', 'color', 'vector-effect',
  'href', 'xlink:href', 'xmlns', 'xmlns:xlink', 'version', 'role', 'aria-label',
]);

// A small, deliberately restricted XML grammar: consume every tag/attribute,
// require quoted values, balanced elements, and exactly one SVG root. This
// rejects unsupported XML/CSS rather than trying to repair or sanitize it.
function isStaticSvg(text: string): boolean {
  const markup = text.replace(/^<\?xml\s+version=["']1\.0["'](?:\s+encoding=["']UTF-8["'])?\s*\?>/i, '').trim();
  if (/<!|<\?|\\|&(?:#|(?!(?:amp|lt|gt|quot|apos);))/.test(markup)) return false;
  const stack: string[] = [];
  let rootSeen = false;
  let cursor = 0;
  const token = /<\/?[a-zA-Z][\w:-]*(?:\s+[\w:-]+\s*=\s*(?:"[^"<>]*"|'[^'<>]*'))*\s*\/?>/gy;
  while (cursor < markup.length) {
    if (markup[cursor] !== '<') {
      const end = markup.indexOf('<', cursor);
      const textEnd = end === -1 ? markup.length : end;
      if (!stack.length && markup.slice(cursor, textEnd).trim()) return false;
      cursor = textEnd;
      continue;
    }
    token.lastIndex = cursor;
    const match = token.exec(markup);
    if (!match) return false;
    const tag = match[0];
    cursor = token.lastIndex;
    const name = /^<\/?([\w:-]+)/.exec(tag)![1];
    if (!STATIC_SVG_TAGS.has(name.toLowerCase())) return false;
    if (tag.startsWith('</')) {
      if (!/^<\/[\w:-]+\s*>$/.test(tag) || stack.pop() !== name) return false;
      continue;
    }
    const isRoot = !rootSeen;
    if (!stack.length) {
      if (rootSeen || name !== 'svg') return false;
      rootSeen = true;
    }
    const seen = new Set<string>();
    for (const attr of tag.matchAll(/\s+([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
      const [, key, , value] = attr;
      if (!STATIC_SVG_ATTRIBUTES.has(key) || seen.has(key) || /[&\u0000-\u001f]/.test(value)) return false;
      seen.add(key);
      if (key === 'xmlns' && (!isRoot || value !== 'http://www.w3.org/2000/svg')) return false;
      if (key === 'xmlns:xlink' && (!isRoot || value !== 'http://www.w3.org/1999/xlink')) return false;
      if ((key === 'href' || key === 'xlink:href') && !/^#[a-zA-Z_][\w.-]*$/.test(value)) return false;
      if (/(?:javascript|data)\s*:|@import/i.test(value)) return false;
      if (/url/i.test(value) && !/^url\(\s*["']?#[\w.-]+["']?\s*\)$/i.test(value)) return false;
    }
    if (!tag.endsWith('/>')) stack.push(name);
  }
  return rootSeen && stack.length === 0;
}

/**
 * Verifies binary magic bytes (file signatures) of uploaded image buffers
 * and inspects SVG payloads to prevent MIME-spoofing and stored XSS attacks.
 */
export function validateImageBuffer(
  buffer: Uint8Array | Buffer,
  declaredMimeType: string
): FileValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      valid: false,
      reason: 'File gambar rusak atau terlalu kecil.',
    };
  }

  switch (declaredMimeType) {
    case 'image/png': {
      // PNG signature: 89 50 4E 47 0D 0A 1A 0A
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a;
      return isPng
        ? { valid: true }
        : { valid: false, reason: 'Signature binary file tidak cocok dengan format PNG.' };
    }

    case 'image/jpeg': {
      // JPEG signature: FF D8 FF
      const isJpeg =
        buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      return isJpeg
        ? { valid: true }
        : { valid: false, reason: 'Signature binary file tidak cocok dengan format JPEG.' };
    }

    case 'image/webp': {
      // WebP signature: "RIFF" (0..3) + size (4..7) + "WEBP" (8..11)
      const isRiff =
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46;
      const isWebp =
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50;
      return isRiff && isWebp
        ? { valid: true }
        : { valid: false, reason: 'Signature binary file tidak cocok dengan format WebP.' };
    }

    case 'image/avif': {
      // ISO Base Media File Format: bytes 4..7 == "ftyp" and brand contains avif/avis/mif1
      const isFtyp =
        buffer[4] === 0x66 &&
        buffer[5] === 0x74 &&
        buffer[6] === 0x79 &&
        buffer[7] === 0x70;
      const headerAscii = Buffer.from(buffer.subarray(8, Math.min(32, buffer.length))).toString(
        'ascii'
      );
      const isAvifBrand =
        headerAscii.includes('avif') ||
        headerAscii.includes('avis');
      return isFtyp && isAvifBrand
        ? { valid: true }
        : { valid: false, reason: 'Signature binary file tidak cocok dengan format AVIF.' };
    }

    case 'image/svg+xml': {
      const text = Buffer.from(buffer).toString('utf8').trim();
      if (!/<svg[\s>]/i.test(text)) {
        return {
          valid: false,
          reason: 'Konten file SVG tidak valid (elemen <svg> tidak ditemukan).',
        };
      }

      if (!isStaticSvg(text)) {
        return { valid: false, reason: 'SVG hanya boleh berisi elemen vektor statis dan referensi lokal.' };
      }

      return { valid: true };
    }

    default:
      return {
        valid: false,
        reason: 'Tipe MIME file tidak diizinkan.',
      };
  }
}
