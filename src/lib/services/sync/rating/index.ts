import { fetchRatingHistory } from './fetch';
import { persistRatingHistory } from './persist';

export async function syncRatingHistory(userId: string, atcoderId: string) {
    const history = await fetchRatingHistory(atcoderId);
    await persistRatingHistory(userId, history);
}
