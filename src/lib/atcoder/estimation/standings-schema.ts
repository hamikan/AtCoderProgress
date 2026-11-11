import { z } from 'zod';

import type { ContestStandings } from './estimate-difficulty';

const taskResultSchema = z.object({
  Count: z.number().nullish(),
  Score: z.number().nullish(),
  Elapsed: z.number().nullish(),
  Status: z.number().nullish(),
});

const standingsEntrySchema = z.object({
  IsTeam: z.boolean().nullish(),
  UserIsDeleted: z.boolean().nullish(),
  Competitions: z.number(),
  OldRating: z.number(),
  TaskResults: z.record(z.string(), taskResultSchema.nullish()).nullish(),
});

export const contestStandingsSchema: z.ZodType<ContestStandings> = z.object({
  TaskInfo: z.array(z.object({ TaskScreenName: z.string().min(1) })),
  StandingsData: z.array(standingsEntrySchema),
});
