export interface RawContest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
}

export interface RawMergedProblem {
  id: string;
  name: string;
  contest_id: string;
  first_contest_id: string;
}

export interface RawContestProblem {
  contest_id: string;
  problem_id: string;
  problem_index: string;
}

export interface RawProblemModel {
  difficulty: number | null;
}

export interface ContestResources {
  contests: Array<RawContest>;
  mergedProblems: Array<RawMergedProblem>;
  contestProblems: Array<RawContestProblem>;
  problemModels: Record<string, RawProblemModel>;
};

export interface NormalizedContestData {
  contests: Array<{ id: string; startEpochSecond: number; durationSecond: number }>;
  problems: Array<{ id: string; name: string; difficulty: number | null; firstContestId: string }>;
  contestProblems: Array<{ contestId: string; problemId: string; problemIndex: string }>;
}
