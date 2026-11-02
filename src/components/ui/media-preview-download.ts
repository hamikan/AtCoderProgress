const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'image/avif': '.avif',
  'image/bmp': '.bmp',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};

/**
 * Derives a download file name from an image URL. Remote file services
 * (e.g. UploadThing) often serve images from URLs whose last path segment
 * is the file key, so that segment is the best name available. Falls back
 * to `image` when the URL has no usable segment.
 */
export function getMediaFileName(url: string): string {
  let pathname = url;

  try {
    pathname = new URL(url).pathname;
  } catch {
    // Not an absolute URL: strip any query string / fragment manually.
    pathname = url.split(/[?#]/)[0];
  }

  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) return 'image';

  let fileName = lastSegment;

  try {
    fileName = decodeURIComponent(lastSegment);
  } catch {
    // Keep the raw segment when it is not valid percent-encoding.
  }

  // A decoded segment must never act as a path or an empty name.
  fileName = fileName.replace(/[\\/:*?"<>|]/g, '_').trim();

  return fileName && fileName !== '.' && fileName !== '..'
    ? fileName
    : 'image';
}

/** Appends an extension matching the blob type when the name has none. */
export function withImageExtension(fileName: string, mimeType: string): string {
  if (/\.[a-zA-Z0-9]+$/.test(fileName)) return fileName;

  const extension = MIME_TYPE_EXTENSIONS[mimeType.split(';')[0].trim()];

  return extension ? `${fileName}${extension}` : fileName;
}

/**
 * Downloads an image in the browser. A plain `<a download>` is ignored for
 * cross-origin URLs, so the image is fetched as a blob first (remote image
 * hosts used by this app send CORS headers that allow this). When the
 * fetch fails, e.g. because of CORS, the original URL is opened in a new
 * tab so the user can still save the image manually.
 */
export async function downloadImage(url: string): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    try {
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = withImageExtension(getMediaFileName(url), blob.type);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
