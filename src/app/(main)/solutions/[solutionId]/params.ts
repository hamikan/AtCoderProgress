import { normalizeSolutionId } from '@/lib/validation/solution-input';

interface SolutionRouteParamsInput {
  solutionId: string;
}

export function normalizeSolutionRouteParams(params: SolutionRouteParamsInput): {
  solutionId: string;
} {
  return {
    solutionId: normalizeSolutionId(params.solutionId),
  };
}
