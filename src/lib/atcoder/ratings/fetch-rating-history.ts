import 'server-only';

import { fetchJson } from '@/lib/atcoder/fetch-json';
import { parseAtCoderId } from '@/lib/atcoder/user-id';
import { getRatingHistoryEndpoint } from './endpoints';
import { ratingHistorySchema } from './schemas';
import type { RatingHistoryResource } from './types';

export async function fetchRatingHistory(
  atcoderId: string
): Promise<RatingHistoryResource[]> {
  const parsedAtCoderId = parseAtCoderId(atcoderId);
  return fetchJson(
    getRatingHistoryEndpoint(parsedAtCoderId),
    ratingHistorySchema
  );
}
