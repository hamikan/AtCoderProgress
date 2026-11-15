import type { NormalizedContestData } from './normalized-contest-data';

type NormalizedContest = NormalizedContestData['contests'][number];
type NormalizedContestProblem = NormalizedContestData['contestProblems'][number];

export interface StoredContestData {
  contests: NormalizedContest[];
  problems: Array<{
    id: string;
    name: string;
    difficulty: number | null;
    customDifficulty: number | null;
    firstContestId: string;
  }>;
  contestProblems: NormalizedContestProblem[];
}

export interface ProblemWrite {
  id: string;
  name: string;
  difficulty: number | null;
  firstContestId: string;
}

export interface ContestDataWritePlan {
  contestsToCreate: NormalizedContest[];
  contestsToUpdate: NormalizedContest[];
  problemsToCreate: ProblemWrite[];
  problemsToUpdate: ProblemWrite[];
  contestProblemsToCreate: NormalizedContestProblem[];
  contestProblemsToUpdate: NormalizedContestProblem[];
  skippedProblemCount: number;
  skippedContestProblemCount: number;
}

export interface PersistContestDataResult {
  createdContestCount: number;
  updatedContestCount: number;
  createdProblemCount: number;
  updatedProblemCount: number;
  createdContestProblemCount: number;
  updatedContestProblemCount: number;
  skippedProblemCount: number;
  skippedContestProblemCount: number;
}

export interface SyncContestsAndProblemsResult extends PersistContestDataResult {
  promotedSubmissionCount: number;
}
