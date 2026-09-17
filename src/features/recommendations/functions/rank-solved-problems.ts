import type {
  RecommendedProblem,
  SolvedRecommendationCandidate,
} from '@/features/recommendations/types';

const DAY_SECONDS = 86_400;
const DEFAULT_RECOMMENDATION_LIMIT = 2;

export function rankSolvedProblems(
  candidates: readonly SolvedRecommendationCandidate[],
  currentEpochSecond: number,
  limit = DEFAULT_RECOMMENDATION_LIMIT
): RecommendedProblem[] {
  return candidates
    .map((candidate) => {
      const elapsedDays = Math.floor(
        (currentEpochSecond - candidate.lastAcceptedEpochSecond) / DAY_SECONDS
      );

      return {
        candidate,
        elapsedDays,
        score:
          candidate.reviewPriority * 100 +
          candidate.averageStars * 10 +
          elapsedDays,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(0, limit))
    .map(({ candidate, elapsedDays }) => ({
      contestId: candidate.contestId,
      difficulty: candidate.difficulty,
      id: candidate.id,
      name: candidate.name,
      reason: `振り返り優先度:${candidate.reviewPriority},  ★:${candidate.averageStars.toFixed(1)}, ${elapsedDays}d ago`,
    }));
}
