import { z } from 'zod';

export const rawSubmissionSchema = z.object({
  id: z.number().int().nonnegative(),
  epoch_second: z.number().int().nonnegative(),
  problem_id: z.string().min(1),
  contest_id: z.string().min(1),
  user_id: z.string().min(1),
  language: z.string(),
  point: z.number(),
  length: z.number().int().nonnegative(),
  result: z.string().min(1),
  execution_time: z.number().int().nonnegative().nullable(),
});

export const rawSubmissionsSchema = z.array(rawSubmissionSchema);
