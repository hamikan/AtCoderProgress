export interface UploadThingFileInfo {
  key: string;
  name: string;
  size: number; // バイト数
  uploadedAt: number; // エポックミリ秒
  status: string;
}

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/g;
const FILE_KEY_PATTERN = /^[A-Za-z0-9._-]+$/;

// 使っている画像を取りこぼすと消してしまうので、v7 以前の URL（utfs.io）も拾う
export function extractUploadThingFileKeys(
  contents: Iterable<string | null | undefined>
): Set<string> {
  const keys = new Set<string>();

  for (const content of contents) {
    if (!content) {
      continue;
    }
    // 本文の JSON では / が \/ にエスケープされていることがある
    const normalized = content.replace(/\\\//g, '/');
    for (const match of normalized.matchAll(URL_PATTERN)) {
      const key = fileKeyFromUrl(match[0]);
      if (key) {
        keys.add(key);
      }
    }
  }

  return keys;
}

function fileKeyFromUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const isUploadThingHost =
    host === 'utfs.io' ||
    host === 'uploadthing.com' ||
    host.endsWith('.ufs.sh') ||
    host.endsWith('.uploadthing.com');
  if (!isUploadThingHost) {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length !== 2 || segments[0] !== 'f') {
    return null;
  }

  const key = segments[1];
  return FILE_KEY_PATTERN.test(key) ? key : null;
}

export interface CleanupSelectionOptions {
  now: number; // エポックミリ秒
  minAgeDays: number;
}

// 貼った直後でまだ解法が保存されていない画像を消さないよう、アップロードから日数がたったものだけを選ぶ
export function selectCleanupCandidates(
  files: readonly UploadThingFileInfo[],
  usedKeys: ReadonlySet<string>,
  options: CleanupSelectionOptions
): UploadThingFileInfo[] {
  const minAgeMs = options.minAgeDays * 24 * 60 * 60 * 1000;

  return files.filter(
    (file) =>
      file.status === 'Uploaded' &&
      !usedKeys.has(file.key) &&
      options.now - file.uploadedAt >= minAgeMs
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1).replace(/\.0$/, '')} ${units[unitIndex]}`;
}
