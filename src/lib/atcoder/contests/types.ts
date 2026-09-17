import type { z } from 'zod';

import type {
  rawContestProblemSchema,
  rawContestSchema,
  rawMergedProblemSchema,
  rawProblemModelSchema,
} from './schemas';

export type RawContest = z.infer<typeof rawContestSchema>;
export type RawMergedProblem = z.infer<typeof rawMergedProblemSchema>;
export type RawContestProblem = z.infer<typeof rawContestProblemSchema>;
export type RawProblemModel = z.infer<typeof rawProblemModelSchema>;

export interface ContestResources {
  contests: Array<RawContest>;
  mergedProblems: Array<RawMergedProblem>;
  contestProblems: Array<RawContestProblem>;
  problemModels: Record<string, RawProblemModel>;
}
