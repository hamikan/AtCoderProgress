import type { SavePayload } from '@/features/solutions/types';

export function buildSaveSignature(payload: SavePayload): string {
  return JSON.stringify([
    payload.problemId,
    payload.contestId,
    payload.title,
    payload.content,
    payload.status,
    payload.tagNames,
  ]);
}

export function getUnflushedPayload(
  latest: SavePayload | null,
  handledSignature: string | null
): SavePayload | null {
  if (!latest) {
    return null;
  }
  if (
    handledSignature !== null &&
    buildSaveSignature(latest) === handledSignature
  ) {
    return null;
  }
  return latest;
}
