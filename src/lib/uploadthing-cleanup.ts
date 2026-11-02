/**
 * Logic for the unused-UploadThing-image cleanup script
 * (scripts/cleanup-unused-images.ts, issue #108).
 *
 * Pure functions only, so the safety-critical decisions — which file keys
 * count as "used" by a solution, and which files may be deleted — are
 * unit-tested without touching UploadThing or the database.
 */

export interface UploadThingFileInfo {
  key: string;
  name: string;
  /** File size in bytes. */
  size: number;
  /** Epoch milliseconds when the file was uploaded. */
  uploadedAt: number;
  status: string;
}

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/g;
const FILE_KEY_PATTERN = /^[A-Za-z0-9._-]+$/;

/**
 * Collects the UploadThing file keys referenced from solution contents.
 *
 * Contents are serialized editor documents, so URLs appear as plain text
 * inside them. Both current URLs (`https://<appId>.ufs.sh/f/<key>`) and
 * legacy ones (`https://utfs.io/f/<key>`, from before the v7 upgrade in
 * #107) are recognized: missing a "used" key could delete a live image,
 * while an extra one only keeps a file around.
 */
export function extractUploadThingFileKeys(
  contents: Iterable<string | null | undefined>
): Set<string> {
  const keys = new Set<string>();

  for (const content of contents) {
    if (!content) {
      continue;
    }
    // Editor JSON may escape slashes as \/ depending on the serializer.
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
  /** Current time as epoch milliseconds. */
  now: number;
  /** Files younger than this many days are never selected. */
  minAgeDays: number;
}

/**
 * Selects the files that may be deleted: fully uploaded, not referenced
 * from any solution content, and uploaded at least `minAgeDays` ago.
 * The age requirement protects images that were uploaded in the editor
 * but whose solution has not been saved yet.
 */
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

/** Formats a byte count the way the script prints it, e.g. "1.5 KB". */
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
