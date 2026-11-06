import 'server-only';

import { fetchRatingHistory } from '@/lib/atcoder/ratings/fetch-rating-history';
import { parseAtCoderId, toAtCoderAccountId } from '@/lib/atcoder/user-id';
import { persistRatingHistory } from './persist-rating-history';

export async function syncRatingHistory(atcoderId: string) {
    const parsedAtCoderId = parseAtCoderId(atcoderId);
    const history = await fetchRatingHistory(parsedAtCoderId);
    await persistRatingHistory(
        toAtCoderAccountId(parsedAtCoderId),
        parsedAtCoderId,
        history
    );
}
