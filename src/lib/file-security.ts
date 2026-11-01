export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

const DANGEROUS_SVG_PATTERNS: RegExp[] = [
  /<script\b/i,
  /\bon[a-z]+\s*=/i, // onload=, onerror=, onclick=, etc.
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /<foreignObject\b/i,
  /<iframe\b/i,
  /<embed\b/i,
  /<object\b/i,
];

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
        headerAscii.includes('avis') ||
        headerAscii.includes('mif1');
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

      for (const pattern of DANGEROUS_SVG_PATTERNS) {
        if (pattern.test(text)) {
          return {
            valid: false,
            reason:
              'File SVG ditolak demi keamanan karena mengandung script atau atribut aktif berbahaya.',
          };
        }
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
