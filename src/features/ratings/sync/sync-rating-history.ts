import 'server-only';

import { fetchRatingHistory } from '@/lib/atcoder/ratings/fetch-rating-history';
import { parseAtCoderId } from '@/lib/atcoder/user-id';
import { persistRatingHistory } from './persist-rating-history';

export async function syncRatingHistory(userId: string, atcoderId: string) {
    const parsedAtCoderId = parseAtCoderId(atcoderId);
    const history = await fetchRatingHistory(parsedAtCoderId);
    return persistRatingHistory(userId, parsedAtCoderId, history);
}
