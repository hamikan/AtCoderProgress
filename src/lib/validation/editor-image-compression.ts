// Editor image compression, applied client-side before upload (issue #68).
//
// Only JPEG / PNG / WebP files larger than the target size are compressed.
// Animated files are passed through untouched, and small
// files are kept as-is to avoid needless quality loss. The compressed file
// keeps its original format and file metadata.

import type { Options } from 'browser-image-compression';

import { EDITOR_IMAGE_COMPRESSIBLE_TYPES } from './editor-image-upload';

export const EDITOR_IMAGE_COMPRESSION_TARGET_BYTES = 1 * 1024 * 1024;
export const EDITOR_IMAGE_COMPRESSION_MAX_WIDTH_OR_HEIGHT = 1920;

interface FileLike {
  name: string;
  size: number;
  type: string;
}

export function shouldCompressEditorImage(file: FileLike): boolean {
  if (
    !EDITOR_IMAGE_COMPRESSIBLE_TYPES.includes(
      file.type as (typeof EDITOR_IMAGE_COMPRESSIBLE_TYPES)[number]
    )
  ) {
    return false;
  }

  return file.size > EDITOR_IMAGE_COMPRESSION_TARGET_BYTES;
}

type ImageCompressor = (file: File, options: Options) => Promise<Blob>;

const compressImage: ImageCompressor = async (file, options) => {
  // Keep canvas code out of the initial bundle and load it only when needed.
  const imageCompression = (await import('browser-image-compression')).default;
  return imageCompression(file, options);
};

async function isAnimatedPng(file: File): Promise<boolean> {
  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (![137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => signature[index] === byte)) {
    return false;
  }

  // acTL must precede IDAT. Skip chunk payloads so large images and metadata
  // do not need to be copied into memory merely to detect animation.
  for (let offset = 8; offset + 12 <= file.size;) {
    const header = new Uint8Array(await file.slice(offset, offset + 8).arrayBuffer());
    const length = new DataView(header.buffer).getUint32(0);
    const nextOffset = offset + length + 12;
    if (nextOffset > file.size) return false;

    const chunkType = String.fromCharCode(...header.subarray(4, 8));
    if (chunkType === 'acTL') return true;
    if (chunkType === 'IDAT' || chunkType === 'IEND') return false;

    offset = nextOffset;
  }

  return false;
}

async function isAnimatedWebp(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 30).arrayBuffer());
  if (header.length < 30) return false;

  const fourCC = (offset: number) => String.fromCharCode(...header.subarray(offset, offset + 4));
  return fourCC(0) === 'RIFF' && fourCC(8) === 'WEBP' && fourCC(12) === 'VP8X' &&
    (header[20] & 0x02) !== 0;
}

export async function compressEditorImageFile(
  file: File,
  compressor: ImageCompressor = compressImage
): Promise<File> {
  if (!shouldCompressEditorImage(file)) {
    return file;
  }

  try {
    if (file.type === 'image/png' && await isAnimatedPng(file)) return file;
    if (file.type === 'image/webp' && await isAnimatedWebp(file)) return file;

    const compressed = await compressor(file, {
      fileType: file.type,
      maxSizeMB: EDITOR_IMAGE_COMPRESSION_TARGET_BYTES / (1024 * 1024),
      maxWidthOrHeight: EDITOR_IMAGE_COMPRESSION_MAX_WIDTH_OR_HEIGHT,
      // The library's default worker imports executable code from a CDN.
      // Compress locally with the bundled module to avoid that extra request.
      useWebWorker: false,
    });

    if (compressed.size >= file.size || (compressed.type && compressed.type !== file.type)) {
      return file;
    }

    return new File([compressed], file.name, {
      lastModified: file.lastModified,
      type: file.type,
    });
  } catch {
    // If compression fails, fall back to the original file; the existing
    // upload validation decides whether it can be uploaded as-is.
    return file;
  }
}
