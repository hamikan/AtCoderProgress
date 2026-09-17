import type { TagStat } from '@/features/problems/types';
import type {
  RecommendedProblem,
  UnsolvedRecommendationCandidate,
} from '@/features/recommendations/types';

const DEFAULT_RECOMMENDATION_LIMIT = 2;

export function rankUnsolvedProblems(
  candidates: readonly UnsolvedRecommendationCandidate[],
  tagStatistics: readonly TagStat[],
  limit = DEFAULT_RECOMMENDATION_LIMIT
): RecommendedProblem[] {
  const tagBonusById = new Map(
    tagStatistics
      .filter(({ total, type }) => total >= 5 && type === 'official')
      .map(({ score, tagId }) => [tagId, (100 - score) / 100])
  );

  return candidates
    .map((candidate) => {
      const tagBonus = candidate.tagIds.reduce(
        (maximum, tagId) => Math.max(maximum, tagBonusById.get(tagId) ?? 0),
        0
      );

      return {
        candidate,
        score: candidate.averageStars + tagBonus + candidate.randomBonus,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => ({
      contestId: candidate.contestId,
      difficulty: candidate.difficulty,
      id: candidate.id,
      name: candidate.name,
      reason: `★:${candidate.averageStars.toFixed(1)}`,
    }));
}
