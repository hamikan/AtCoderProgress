import type { z } from 'zod';

import type { ratingHistoryItemSchema } from './schemas';

export type RatingHistoryResource = z.infer<typeof ratingHistoryItemSchema>;
