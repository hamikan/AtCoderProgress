import { prisma } from '@/lib/prisma';
import { Prisma, SolutionStatus } from '@prisma/client';
import { normalizeSolutionInput } from '@/lib/validation/solution-input';

export type SolutionWithTags = Prisma.SolutionGetPayload<{
  include: {
    userTags: {
      include: {
        userTag: true;
      };
    };
  };
}>;

export interface ProblemContestOption {
  contestId: string;
  problemIndex: string;
}

export interface ProblemDetail {
  id: string;
  name: string;
  difficulty: number | null;
  firstContest: { id: string };
  problemIndex: string;
  contests: ProblemContestOption[];
}

export interface SolutionListItem {
  latestSolutionId: string;
  problemId: string;
  problemIndex: string;
  problemName: string;
  contestId: string;
  difficulty: number | null;
  updatedAt: Date;
  solutionCount: number;
}

export interface SolutionRecordListItem {
  id: string;
  contestId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: SolutionStatus;
}

export async function getProblemDetail(problemId: string): Promise<ProblemDetail | null> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      contests: true,
    },
  });

  if (!problem) {
    return null;
  }

  const contests = [...problem.contests].sort((a, b) => a.contestId.localeCompare(b.contestId));
  const primaryContest =
    contests.find((contest) => contest.contestId === problem.firstContestId) ?? contests[0] ?? null;

  return {
    id: problem.id,
    name: problem.name,
    difficulty: problem.difficulty,
    firstContest: {
      id: problem.firstContestId,
    },
    problemIndex: primaryContest?.problemIndex ?? '',
    contests: contests.map((contest) => ({
      contestId: contest.contestId,
      problemIndex: contest.problemIndex,
    })),
  };
}

export async function getSolutionById(userId: string, solutionId: string): Promise<SolutionWithTags | null> {
  return await prisma.solution.findFirst({
    where: {
      id: solutionId,
      userId,
    },
    include: {
      userTags: {
        include: {
          userTag: true,
        },
      },
    },
  });
}

export async function getSolutionsByProblemAndContest(
  userId: string,
  problemId: string,
  contestId: string
): Promise<SolutionRecordListItem[]> {
  const solutions = await prisma.solution.findMany({
    where: {
      userId,
      problemId,
      contestId,
    },
    orderBy: [
      { createdAt: 'asc' },
      { id: 'asc' },
    ],
    select: {
      id: true,
      contestId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  return solutions;
}

export async function saveSolutionRecord(
  userId: string,
  {
    solutionId,
    problemId,
    contestId,
    title,
    content,
    status,
    tagNames,
  }: {
    solutionId?: string | null;
    problemId: string;
    contestId: string;
    title: string | null;
    content: string;
    status: SolutionStatus;
    tagNames: string[];
  }
): Promise<string> {
  const normalizedInput = normalizeSolutionInput({
    contestId,
    content,
    problemId,
    solutionId,
    status,
    tagNames,
    title,
  });

  return prisma.$transaction(async (tx) => {
    const contestProblem = await tx.contestProblem.findUnique({
      where: {
        contestId_problemId: {
          contestId: normalizedInput.contestId,
          problemId: normalizedInput.problemId,
        },
      },
      select: {
        contestId: true,
        problemId: true,
      },
    });

    if (!contestProblem) {
      throw new Error('Invalid contest for problem');
    }

    let savedSolutionId = normalizedInput.solutionId;

    if (savedSolutionId) {
      const existingSolution = await tx.solution.findFirst({
        where: {
          id: savedSolutionId,
          userId,
        },
        select: { id: true },
      });

      if (!existingSolution) {
        throw new Error('Solution not found');
      }

      await tx.solution.update({
        where: { id: savedSolutionId },
        data: {
          contestId: normalizedInput.contestId,
          content: normalizedInput.content,
          problemId: normalizedInput.problemId,
          status: normalizedInput.status,
          title: normalizedInput.title,
        },
      });
    } else {
      const created = await tx.solution.create({
        data: {
          contestId: normalizedInput.contestId,
          content: normalizedInput.content,
          problemId: normalizedInput.problemId,
          status: normalizedInput.status,
          title: normalizedInput.title,
          userId,
        },
      });

      savedSolutionId = created.id;
    }

    await tx.solutionUserTag.deleteMany({
      where: { solutionId: savedSolutionId },
    });

    if (normalizedInput.tagNames.length > 0) {
      const userTags = await Promise.all(
        normalizedInput.tagNames.map((name) =>
          tx.userTag.upsert({
            where: {
              createdById_name: {
                createdById: userId,
                name,
              },
            },
            create: { createdById: userId, name },
            update: {},
          })
        )
      );

      await tx.solutionUserTag.createMany({
        data: userTags.map((tag) => ({
          solutionId: savedSolutionId,
          userTagId: tag.id,
        })),
      });
    }

    return savedSolutionId;
  });
}

export async function getUserSolutions(userId: string): Promise<SolutionListItem[]> {
  const solutions = await prisma.solution.findMany({
    where: { userId },
    include: {
      problem: {
        include: {
          contests: true,
        },
      },
    },
    orderBy: [
      { updatedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  const groupedSolutions = new Map<string, SolutionListItem>();

  for (const solution of solutions) {
    const key = `${solution.contestId}:${solution.problemId}`;
    const problemIndex =
      solution.problem.contests.find((contest) => contest.contestId === solution.contestId)?.problemIndex ?? '';

    if (!groupedSolutions.has(key)) {
      groupedSolutions.set(key, {
        latestSolutionId: solution.id,
        problemId: solution.problemId,
        problemIndex,
        problemName: solution.problem.name,
        contestId: solution.contestId,
        difficulty: solution.problem.difficulty,
        updatedAt: solution.updatedAt,
        solutionCount: 1,
      });
      continue;
    }

    const currentEntry = groupedSolutions.get(key)!;
    groupedSolutions.set(key, {
      ...currentEntry,
      solutionCount: currentEntry.solutionCount + 1,
    });
  }

  return [...groupedSolutions.values()];
}
