export interface ContestRow {
  id: string;
  startEpochSecond: number;
  durationSecond: bigint;
  problems: Array<{
    problemIndex: string;
    problem: {
      id: string;
      name: string;
      difficulty: number | null;
      totalSolutionCount: number;
    };
  }>;
}
