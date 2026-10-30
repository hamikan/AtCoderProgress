export const EDITOR_IMAGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE = '4MB';
export const EDITOR_IMAGE_UPLOAD_SOURCE_MAX_BYTES = 64 * 1024 * 1024;
export const EDITOR_IMAGE_UPLOAD_SOURCE_MAX_FILE_SIZE = '64MB';
export const EDITOR_IMAGE_ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
export const EDITOR_IMAGE_COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EDITOR_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'] as const;

const SVG_MIME_TYPE = 'image/svg+xml';

type EditorImageValidationResult =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

interface FileLike {
  name: string;
  size: number;
  type: string;
}

function getFileExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? '';
}

function validateEditorImageFormat(file: FileLike): EditorImageValidationResult {
  if (file.type === SVG_MIME_TYPE) {
    return {
      message: 'SVG画像はアップロードできません。PNG、JPEG、WebP、GIFを使用してください。',
      ok: false,
    };
  }

  if (!EDITOR_IMAGE_ACCEPT.includes(file.type as (typeof EDITOR_IMAGE_ACCEPT)[number])) {
    return {
      message: 'PNG、JPEG、WebP、GIF形式の画像だけアップロードできます。',
      ok: false,
    };
  }

  const extension = getFileExtension(file.name);
  if (!EDITOR_IMAGE_EXTENSIONS.includes(extension as (typeof EDITOR_IMAGE_EXTENSIONS)[number])) {
    return {
      message: '画像ファイルの拡張子は .png、.jpg、.jpeg、.webp、.gif のいずれかにしてください。',
      ok: false,
    };
  }

  return { ok: true };
}

export function validateEditorImageFile(file: FileLike): EditorImageValidationResult {
  const formatValidation = validateEditorImageFormat(file);
  if (!formatValidation.ok) return formatValidation;

  if (file.size > EDITOR_IMAGE_UPLOAD_MAX_BYTES) {
    return { message: '画像サイズは4MB以下にしてください。', ok: false };
  }

  return { ok: true };
}

export function validateEditorImageFileBeforeCompression(file: FileLike): EditorImageValidationResult {
  const formatValidation = validateEditorImageFormat(file);
  if (!formatValidation.ok) return formatValidation;

  if (file.size > EDITOR_IMAGE_UPLOAD_SOURCE_MAX_BYTES) {
    return { message: '圧縮前の画像サイズは64MB以下にしてください。', ok: false };
  }

  if (EDITOR_IMAGE_COMPRESSIBLE_TYPES.includes(file.type as (typeof EDITOR_IMAGE_COMPRESSIBLE_TYPES)[number])) {
    return { ok: true };
  }

  return validateEditorImageFile(file);
}
