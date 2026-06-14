import {
  normalizeContestId,
  normalizeProblemId,
} from '@/lib/validation/solution-input';

interface NewSolutionSearchParamsInput {
  contestId?: string;
  problemId?: string;
}

function normalizeOptionalParam(
  value: string | undefined,
  normalize: (input: unknown) => string
): string | null {
  if (!value) {
    return null;
  }

  try {
    return normalize(value);
  } catch {
    return null;
  }
}

export function normalizeNewSolutionSearchParams(params: NewSolutionSearchParamsInput): {
  contestId: string | null;
  problemId: string | null;
} {
  return {
    contestId: normalizeOptionalParam(params.contestId, normalizeContestId),
    problemId: normalizeOptionalParam(params.problemId, normalizeProblemId),
  };
}
