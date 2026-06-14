export const EDITOR_IMAGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE = '4MB';
export const EDITOR_IMAGE_ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;

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

export function validateEditorImageFile(file: FileLike): EditorImageValidationResult {
  if (file.size > EDITOR_IMAGE_UPLOAD_MAX_BYTES) {
    return {
      message: '画像サイズは4MB以下にしてください。',
      ok: false,
    };
  }

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
