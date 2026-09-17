export interface ProblemContestOption {
  contestId: string;
  problemIndex: string;
}

export interface ProblemDetail {
  id: string;
  name: string;
  difficulty: number | null;
  firstContest: { id: string };
  problemIndex: string;
  contests: ProblemContestOption[];
}
