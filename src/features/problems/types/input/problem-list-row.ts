import type { ProblemStatus } from '../output/problem';

export interface ProblemListRow {
  id: string;
  name: string;
  firstContestId: string;
  difficulty: number | null;
  totalSolutionCount: number;
  contests: Array<{
    contestId: string;
    problemIndex: string;
  }>;
  solutions: Array<{
    status: ProblemStatus;
  }>;
  submissions: Array<{
    id: number;
  }>;
  _count: {
    submissions: number;
  };
}
