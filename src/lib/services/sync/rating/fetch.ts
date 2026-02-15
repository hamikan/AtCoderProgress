import { fetchJson } from '../utils';
import type { RatingHistoryResource } from './types';
import { ATCODER_UNOFFICIAL_ENDPOINTS } from '../providers/atcoder-unofficial/endpoints';

export async function fetchRatingHistory(atcoderId: string): Promise<RatingHistoryResource[]> {
    const url = ATCODER_UNOFFICIAL_ENDPOINTS.RATING_HISTORY(atcoderId);
    return await fetchJson<RatingHistoryResource[]>(url);
}
