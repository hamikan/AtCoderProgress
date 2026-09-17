import 'server-only';

import { SolutionStatus } from '@prisma/client';
import { subDays } from 'date-fns';

import { getTagStatistics } from '@/features/problems/api/get-tag-statistics';
import type { ProblemDifficultyRange } from '@/features/problems/types';
import { rankSolvedProblems } from '@/features/recommendations/functions/rank-solved-problems';
import { rankUnsolvedProblems } from '@/features/recommendations/functions/rank-unsolved-problems';
import type {
  RecommendedProblem,
  RecommendedProblems,
} from '@/features/recommendations/types';
import { prisma } from '@/lib/prisma';

export async function getRecommendedProblems(
  userId: string | undefined,
  currentRating: number
): Promise<RecommendedProblems> {
  if (!userId) {
    return { unsolved: [], solved: [] };
  }

  const difficultyRange = {
    max: currentRating + 400,
    min: Math.max(0, currentRating - 100),
  };
  const now = new Date();

  const [unsolved, solved] = await Promise.all([
    getUnsolvedRecommendations(userId, difficultyRange),
    getSolvedRecommendations(userId, difficultyRange, now),
  ]);

  return { solved, unsolved };
}

async function getUnsolvedRecommendations(
  userId: string,
  difficultyRange: ProblemDifficultyRange
): Promise<RecommendedProblem[]> {
  const tagStatistics = await getTagStatistics(userId, difficultyRange);
  const difficulty = {
    gte: difficultyRange.min,
    lte: difficultyRange.max,
  };
  const unsolvedWhere = {
    difficulty,
    NOT: {
      OR: [
        { submissions: { some: { result: 'AC', userId } } },
        {
          solutions: {
            some: {
              status: {
                in: [
                  SolutionStatus.AC,
                  SolutionStatus.SELF_AC,
                  SolutionStatus.EXPLANATION_AC,
                  SolutionStatus.REVIEW_AC,
                ],
              },
              userId,
            },
          },
        },
      ],
    },
  };

  const [problems, starAggregates] = await Promise.all([
    prisma.problem.findMany({
      include: { problemTags: { select: { tagId: true } } },
      where: unsolvedWhere,
    }),
    prisma.problemReview.groupBy({
      _avg: { stars: true },
      by: ['problemId'],
      where: { problem: unsolvedWhere },
    }),
  ]);

  const averageStarsByProblemId = new Map(
    starAggregates.map(({ _avg, problemId }) => [problemId, _avg.stars ?? 3])
  );

  return rankUnsolvedProblems(
    problems.map((problem) => ({
      averageStars: averageStarsByProblemId.get(problem.id) ?? 3,
      contestId: problem.firstContestId,
      difficulty: problem.difficulty,
      id: problem.id,
      name: problem.name,
      randomBonus: Math.random() * 0.5,
      tagIds: problem.problemTags.map(({ tagId }) => tagId),
    })),
    tagStatistics
  );
}

async function getSolvedRecommendations(
  userId: string,
  difficultyRange: ProblemDifficultyRange,
  now: Date
): Promise<RecommendedProblem[]> {
  const difficulty = {
    gte: difficultyRange.min,
    lte: difficultyRange.max,
  };
  const oneMonthAgoEpoch = Math.floor(subDays(now, 30).getTime() / 1000);

  const [acceptedSubmissions, userReviews, starAggregates] = await Promise.all([
    prisma.submission.groupBy({
      _max: { epochSecond: true },
      by: ['problemId'],
      where: { problem: { difficulty }, result: 'AC', userId },
    }),
    prisma.problemReview.findMany({ where: { userId } }),
    prisma.problemReview.groupBy({
      _avg: { stars: true },
      by: ['problemId'],
    }),
  ]);

  const candidateIds = acceptedSubmissions
    .filter(
      ({ _max }) =>
        _max.epochSecond !== null && _max.epochSecond < oneMonthAgoEpoch
    )
    .map(({ problemId }) => problemId);

  if (candidateIds.length === 0) return [];

  const problems = await prisma.problem.findMany({
    where: { id: { in: candidateIds } },
  });
  const lastAcceptedAtByProblemId = new Map(
    acceptedSubmissions.map(({ _max, problemId }) => [
      problemId,
      _max.epochSecond ?? 0,
    ])
  );
  const reviewPriorityByProblemId = new Map(
    userReviews.map(({ problemId, reviewPriority }) => [
      problemId,
      reviewPriority,
    ])
  );
  const averageStarsByProblemId = new Map(
    starAggregates.map(({ _avg, problemId }) => [problemId, _avg.stars ?? 3])
  );

  return rankSolvedProblems(
    problems.map((problem) => ({
      averageStars: averageStarsByProblemId.get(problem.id) ?? 3,
      contestId: problem.firstContestId,
      difficulty: problem.difficulty,
      id: problem.id,
      lastAcceptedEpochSecond:
        lastAcceptedAtByProblemId.get(problem.id) ?? 0,
      name: problem.name,
      reviewPriority: reviewPriorityByProblemId.get(problem.id) ?? 3,
    })),
    Math.floor(now.getTime() / 1000)
  );
}
