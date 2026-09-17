import { z } from 'zod';

export const ratingHistoryItemSchema = z.object({
  IsRated: z.boolean(),
  Place: z.number().int(),
  OldRating: z.number().int(),
  NewRating: z.number().int(),
  Performance: z.number().int(),
  InnerPerformance: z.number().int(),
  ContestScreenName: z.string().min(1),
  ContestName: z.string(),
  ContestNameEn: z.string(),
  EndTime: z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid rating history end time',
  }),
});

export const ratingHistorySchema = z.array(ratingHistoryItemSchema);
