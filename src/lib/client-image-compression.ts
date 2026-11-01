/**
 * Client-side image compression using HTML5 Canvas.
 * Automatically resizes and compresses images larger than 1MB to WebP format.
 * Zero external libraries needed, runs 100% in the user's browser.
 */
export async function compressImageIfNeeded(
  file: File,
  maxSizeBytes = 1024 * 1024, // 1MB trigger threshold
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85
): Promise<{ file: File; compressed: boolean; originalSize: number; newSize: number }> {
  const originalSize = file.size;

  // SVG files are vector codes; do not process with raster canvas
  if (file.type === 'image/svg+xml') {
    return { file, compressed: false, originalSize, newSize: originalSize };
  }

  // If already smaller than threshold, keep original
  if (file.size <= maxSizeBytes) {
    return { file, compressed: false, originalSize, newSize: originalSize };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional resize if exceeding maxWidth / maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ file, compressed: false, originalSize, newSize: originalSize });
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ file, compressed: false, originalSize, newSize: originalSize });
            }

            const baseName =
              file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const compressedFile = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            // Return compressed file if it's smaller
            if (compressedFile.size < file.size) {
              resolve({
                file: compressedFile,
                compressed: true,
                originalSize,
                newSize: compressedFile.size,
              });
            } else {
              resolve({ file, compressed: false, originalSize, newSize: originalSize });
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, compressed: false, originalSize, newSize: originalSize });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, compressed: false, originalSize, newSize: originalSize });
    };

    reader.readAsDataURL(file);
  });
}
