import { fetchJson } from '../utils';
import type { RatingHistoryResource } from './types';
import { ATCODER_UNOFFICIAL_ENDPOINTS } from '../providers/atcoder-unofficial/endpoints';
import { normalizeAtCoderId } from '@/lib/validation/atcoder-id';

export async function fetchRatingHistory(atcoderId: string): Promise<RatingHistoryResource[]> {
    const url = ATCODER_UNOFFICIAL_ENDPOINTS.RATING_HISTORY(normalizeAtCoderId(atcoderId));
    return await fetchJson<RatingHistoryResource[]>(url);
}
