export type ProblemStatus = 'SELF_AC' | 'EXPLANATION_AC' | 'REVIEW_AC' | 'TRYING' | 'UNSOLVED';

export interface Problem {
  id: string;
  name: string;
  difficulty: number | null;
  totalSolutionCount: number;
}

export interface ProblemListItem {
  id: string;
  name: string;
  contestId: string;
  problemIndex: string;
  difficulty: number | null;
  status?: ProblemStatus;
  tags?: string[];
  totalSolutionCount?: number;
}