import { z } from 'zod';

export const rawContestSchema = z.object({
  id: z.string().min(1),
  start_epoch_second: z.number().int().nonnegative(),
  duration_second: z.number().int().nonnegative(),
});

export const rawMergedProblemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  contest_id: z.string().min(1),
  first_contest_id: z.string(),
});

export const rawContestProblemSchema = z.object({
  contest_id: z.string().min(1),
  problem_id: z.string().min(1),
  problem_index: z.string().min(1),
});

export const rawProblemModelSchema = z.object({
  difficulty: z.number().nullable(),
});

export const contestsSchema = z.array(rawContestSchema);
export const mergedProblemsSchema = z.array(rawMergedProblemSchema);
export const contestProblemsSchema = z.array(rawContestProblemSchema);
export const problemModelsSchema = z.record(z.string(), rawProblemModelSchema);
