// Editor image compression, applied client-side before upload (issue #68).
//
// Only JPEG / PNG / WebP files larger than the target size are compressed.
// GIF is passed through untouched so animations are not broken, and small
// files are kept as-is to avoid needless quality loss. The compressed file
// keeps its original format and file name.

export const EDITOR_IMAGE_COMPRESSION_TARGET_BYTES = 1 * 1024 * 1024;
export const EDITOR_IMAGE_COMPRESSION_MAX_WIDTH_OR_HEIGHT = 1920;

const COMPRESSIBLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

interface FileLike {
  name: string;
  size: number;
  type: string;
}

export function shouldCompressEditorImage(file: FileLike): boolean {
  if (
    !COMPRESSIBLE_IMAGE_TYPES.includes(
      file.type as (typeof COMPRESSIBLE_IMAGE_TYPES)[number]
    )
  ) {
    return false;
  }

  return file.size > EDITOR_IMAGE_COMPRESSION_TARGET_BYTES;
}

export async function compressEditorImageFile(file: File): Promise<File> {
  if (!shouldCompressEditorImage(file)) {
    return file;
  }

  try {
    // Loaded dynamically so the compression library (canvas / Web Worker)
    // stays out of the initial bundle and out of server-side module graphs.
    const imageCompression = (await import('browser-image-compression')).default;

    const compressed = await imageCompression(file, {
      fileType: file.type,
      maxSizeMB: EDITOR_IMAGE_COMPRESSION_TARGET_BYTES / (1024 * 1024),
      maxWidthOrHeight: EDITOR_IMAGE_COMPRESSION_MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
    });

    if (compressed instanceof File && compressed.name === file.name) {
      return compressed;
    }

    return new File([compressed], file.name, {
      lastModified: file.lastModified,
      type: compressed.type || file.type,
    });
  } catch {
    // If compression fails, fall back to the original file; the existing
    // upload validation decides whether it can be uploaded as-is.
    return file;
  }
}
