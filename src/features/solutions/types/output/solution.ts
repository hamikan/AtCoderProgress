export type SolutionStatus =
  | 'SELF_AC'
  | 'EXPLANATION_AC'
  | 'REVIEW_AC'
  | 'AC'
  | 'TRYING'
  | 'UNSOLVED';

export interface SolutionListItem {
  latestSolutionId: string;
  problemId: string;
  problemIndex: string;
  problemName: string;
  contestId: string;
  difficulty: number | null;
  updatedAt: string;
  solutionCount: number;
}

export interface SolutionRecordListItem {
  id: string;
  contestId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  status: SolutionStatus;
}

export interface SolutionWithTags {
  id: string;
  userId: string | null;
  problemId: string;
  contestId: string;
  title: string | null;
  content: string | null;
  status: SolutionStatus;
  createdAt: string;
  updatedAt: string;
  userTags: Array<{
    userTag: {
      name: string;
    };
  }>;
}
