export interface NormalizedContestData {
  contests: Array<{
    id: string;
    startEpochSecond: number;
    durationSecond: number;
  }>;
  problems: Array<{
    id: string;
    name: string;
    difficulty: number | null;
    firstContestId: string;
  }>;
  contestProblems: Array<{
    contestId: string;
    problemId: string;
    problemIndex: string;
  }>;
}
