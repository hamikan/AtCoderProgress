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

// The newest payload the save pipeline has not taken responsibility
// for yet, or null when everything typed so far is already queued or
// saved. Used to flush input that is still inside the debounce window
// when the editor is left (issue #132).
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
