export interface RecommendedProblem {
  id: string;
  name: string;
  difficulty: number | null;
  contestId: string;
  reason: string;
}

export interface RecommendedProblems {
  unsolved: RecommendedProblem[];
  solved: RecommendedProblem[];
}
