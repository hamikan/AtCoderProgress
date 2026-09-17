export interface RatingHistoryRow {
  oldRating: number;
  newRating: number;
  performance: number;
  contestName: string;
  contestScreenName: string;
  endTime: Date;
}

export interface SubmissionRow {
  problemId: string;
  contestId: string;
  result: string;
  epochSecond: number;
  problem: {
    id: string;
    name: string;
    difficulty: number | null;
  };
}

export interface CurriculumRow {
  contestId: string;
  problemId: string;
  problemIndex: string;
  problem: {
    name: string;
    difficulty: number | null;
  };
}

export interface FirstAcceptedProblem {
  problemId: string;
  contestId: string;
  title: string;
  difficulty: number | null;
  epochSecond: number;
}
