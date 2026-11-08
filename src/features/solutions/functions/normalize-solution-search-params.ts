import {
  parseContestId,
  parseProblemId,
} from '@/features/solutions/schemas/solution';
import type { SolutionSearchParamsInput } from '@/features/solutions/types';

function normalizeOptionalParam(
  value: string | undefined,
  parser: (input: unknown) => string
): string | null {
  if (!value) {
    return null;
  }

  try {
    return parser(value);
  } catch {
    return null;
  }
}

export function normalizeSolutionSearchParams(params: SolutionSearchParamsInput): {
  contestId: string | null;
  problemId: string | null;
} {
  return {
    contestId: normalizeOptionalParam(params.contestId, parseContestId),
    problemId: normalizeOptionalParam(params.problemId, parseProblemId),
  };
}
