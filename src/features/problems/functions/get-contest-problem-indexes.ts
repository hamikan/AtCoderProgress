import type { ContestKind } from '@/features/problems/types';

const PROBLEM_INDEXES: Readonly<Record<ContestKind, ReadonlyArray<string>>> = {
  abc: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex'],
  arc: ['A', 'B', 'C', 'D', 'E', 'F', 'F2'],
  agc: ['A', 'B', 'C', 'D', 'E', 'F', 'F2'],
};

export function getContestProblemIndexes(contestType: ContestKind): Array<string> {
  return [...PROBLEM_INDEXES[contestType]];
}
