interface RecommendationCandidate {
  contestId: string;
  difficulty: number | null;
  id: string;
  name: string;
}

export interface UnsolvedRecommendationCandidate
  extends RecommendationCandidate {
  averageStars: number;
  randomBonus: number;
  tagIds: readonly string[];
}

export interface SolvedRecommendationCandidate
  extends RecommendationCandidate {
  averageStars: number;
  lastAcceptedEpochSecond: number;
  reviewPriority: number;
}
