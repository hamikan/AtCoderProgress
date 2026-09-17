import { parseSolutionId } from '@/features/solutions/schemas/solution';
import type { SolutionRouteParamsInput } from '@/features/solutions/types';

export function parseSolutionRouteParams(params: SolutionRouteParamsInput): {
  solutionId: string;
} {
  return {
    solutionId: parseSolutionId(params.solutionId),
  };
}
