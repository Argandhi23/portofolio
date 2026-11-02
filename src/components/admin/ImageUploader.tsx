'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadMedia, deleteMedia } from '@/actions/storage.actions';
import { compressImageIfNeeded } from '@/lib/client-image-compression';
import { UploadCloud, X, Loader2, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  autoDeleteOldOnRemove?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  label = 'Unggah Gambar',
  aspectRatio = 'video',
  autoDeleteOldOnRemove = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [compressStatus, setCompressStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setError(null);
    setCompressStatus(null);
    setIsUploading(true);

    try {
      let fileToUpload = rawFile;

      // Otomatis kompresi jika file lebih besar dari 1MB (kecuali SVG)
      if (rawFile.size > 1024 * 1024 && rawFile.type !== 'image/svg+xml') {
        setCompressStatus('Mengompresi gambar otomatis...');
        const compressionResult = await compressImageIfNeeded(rawFile, 1024 * 1024);
        if (compressionResult.compressed) {
          fileToUpload = compressionResult.file;
          const originalMB = (compressionResult.originalSize / (1024 * 1024)).toFixed(1);
          const newKB = (compressionResult.newSize / 1024).toFixed(0);
          setCompressStatus(`Otomatis dikompres dari ${originalMB}MB ke ${newKB}KB (WebP)`);
        }
      }

      // Validasi batas akhir Supabase Storage 5MB
      if (fileToUpload.size > 5 * 1024 * 1024) {
        setError('Ukuran file tetap melebihi batas 5MB setelah kompresi.');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);

      const result = await uploadMedia(formData);

      if (result.success && result.data?.url) {
        onChange(result.data.url);
      } else {
        setError(result.message || 'Gagal mengunggah file.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses gambar.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (value && autoDeleteOldOnRemove) {
      await deleteMedia(value);
    }
    onChange('');
    setError(null);
    setCompressStatus(null);
  };

  const ratioClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[200px]'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : aspectRatio === 'video'
      ? 'aspect-[16/10]'
      : 'min-h-[160px]';

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </span>
      )}

      {value ? (
        <div
          className={`relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 ${ratioClass}`}
        >
          <Image
            src={value}
            alt="Preview Gambar"
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 500px"
            unoptimized={value.startsWith('data:') || value.endsWith('.svg')}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition"
            >
              <X className="h-3.5 w-3.5" />
              <span>Hapus Gambar</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Ganti</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center hover:border-orange-500/50 hover:bg-zinc-900/80 transition cursor-pointer group ${ratioClass}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-xs text-zinc-300 font-medium">
                {compressStatus || 'Mengunggah ke Supabase Storage...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-zinc-200 transition">
              <div className="h-10 w-10 rounded-full bg-zinc-800/80 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:text-orange-500 transition">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-zinc-300">
                Klik untuk unggah gambar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png,image/avif,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Compression notification badge */}
      {compressStatus && !isUploading && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <Sparkles className="h-3 w-3" />
          <span>{compressStatus}</span>
        </div>
      )}

      {/* Manual URL input fallback */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-zinc-500">URL gambar:</span>
        <input
          type="text"
          placeholder="https://... atau /projects/..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-400 pt-0.5">{error}</p>}
    </div>
  );
}
