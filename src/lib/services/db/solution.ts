import { prisma } from '@/lib/prisma';
import { SolutionStatus, Prisma } from '@prisma/client';

export type SolutionWithTags = Prisma.SolutionGetPayload<{
  include: {
    userTags: {
      include: {
        userTag: true;
      };
    };
  };
}>;

/**
 * 指定された問題の基本情報を取得します。
 */
export async function getProblemDetail(problemId: string) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      contests: {
        include: {
          contest: true,
        },
        take: 1,
      },
    },
  });

  if (!problem) return null;

  return {
    id: problem.id,
    name: problem.name,
    difficulty: problem.difficulty,
    firstContest: {
      id: problem.firstContestId,
    },
  };
}

/**
 * ユーザーの特定の問題に対する解法記録を取得します。
 * 複数ある場合は最新の1件を返します。
 */
export async function getSolutionByProblemId(userId: string, problemId: string): Promise<SolutionWithTags | null> {
  return await prisma.solution.findFirst({
    where: {
      userId,
      problemId,
    },
    include: {
      userTags: {
        include: {
          userTag: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}
