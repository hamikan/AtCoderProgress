import { fetchRatingHistory } from './fetch';
import { persistRatingHistory } from './persist';
import { normalizeAtCoderId } from '@/lib/validation/atcoder-id';

export async function syncRatingHistory(userId: string, atcoderId: string) {
    const normalizedAtCoderId = normalizeAtCoderId(atcoderId);
    const history = await fetchRatingHistory(normalizedAtCoderId);
    return persistRatingHistory(userId, normalizedAtCoderId, history);
}
