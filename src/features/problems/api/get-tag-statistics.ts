import 'server-only';

import type { Prisma } from '@prisma/client';

import {
  buildOfficialTagStatistics,
  buildUnlinkedTagStatistics,
  getProblemIdsByUserTag,
} from '@/features/problems/functions/build-tag-statistics';
import type {
  ProblemDifficultyRange,
  TagStat,
} from '@/features/problems/types';
import { prisma } from '@/lib/prisma';

export async function getTagStatistics(
  userId?: string,
  difficultyRange?: ProblemDifficultyRange
): Promise<TagStat[]> {
  const problemWhere: Prisma.ProblemWhereInput | undefined = difficultyRange
    ? {
        difficulty: {
          gte: difficultyRange.min,
          lte: difficultyRange.max,
        },
      }
    : undefined;
  const [userTags, masterTags, totalCounts, solvedCounts] = await Promise.all([
    userId
      ? prisma.userTag.findMany({
          where: { createdById: userId },
          select: { id: true, name: true, tagId: true },
        })
      : [],
    prisma.tag.findMany({ select: { id: true, name: true } }),
    prisma.problemTag.groupBy({
      by: ['tagId'],
      _count: { _all: true },
      where: { problem: problemWhere },
    }),
    userId
      ? prisma.problemTag.groupBy({
          by: ['tagId'],
          _count: { _all: true },
          where: {
            problem: {
              ...problemWhere,
              OR: [
                { submissions: { some: { userId, result: 'AC' } } },
                {
                  solutions: {
                    some: {
                      userId,
                      status: {
                        in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'],
                      },
                    },
                  },
                },
              ],
            },
          },
        })
      : [],
  ]);
  const base = buildOfficialTagStatistics({
    masterTags,
    solvedCounts,
    totalCounts,
    userTags,
  });

  if (!userId || base.unlinkedUserTags.length === 0) {
    return base.stats.toSorted((left, right) => right.score - left.score);
  }

  const solutionUserTags = await prisma.solutionUserTag.findMany({
    where: {
      userTagId: { in: base.unlinkedUserTags.map((tag) => tag.id) },
    },
    select: {
      userTagId: true,
      solution: { select: { problemId: true } },
    },
  });
  const problemIdsByTag = getProblemIdsByUserTag(solutionUserTags);
  const allProblemIds = new Set(
    [...problemIdsByTag.values()].flatMap((problemIds) => [...problemIds])
  );
  const solvedProblemIds = new Set(
    allProblemIds.size > 0
      ? (
          await prisma.problem.findMany({
            where: {
              id: { in: [...allProblemIds] },
              ...problemWhere,
              OR: [
                { submissions: { some: { userId, result: 'AC' } } },
                {
                  solutions: {
                    some: {
                      userId,
                      status: {
                        in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'],
                      },
                    },
                  },
                },
              ],
            },
            select: { id: true },
          })
        ).map((problem) => problem.id)
      : []
  );
  const unlinkedStats = buildUnlinkedTagStatistics({
    problemIdsByTag,
    solvedProblemIds,
    userTags: base.unlinkedUserTags,
  });

  return [...base.stats, ...unlinkedStats].toSorted(
    (left, right) => right.score - left.score
  );
}
