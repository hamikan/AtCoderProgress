import { normalizeSolutionId } from '@/lib/validation/solution-input';

interface SolutionRouteParamsInput {
  problemId: string;
}

export function normalizeSolutionRouteParams(params: SolutionRouteParamsInput): {
  solutionId: string;
} {
  return {
    solutionId: normalizeSolutionId(params.problemId),
  };
}
