import { prisma } from '@/lib/prisma';
import { Prisma, SolutionStatus } from '@prisma/client';

const MAX_SOLUTION_TITLE_LENGTH = 120;
const MAX_TAGS = 20;
const MAX_TAG_NAME_LENGTH = 50;
const VALID_SOLUTION_STATUSES = new Set<SolutionStatus>(
  Object.values(SolutionStatus) as SolutionStatus[]
);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPlateTextNode(node: unknown): boolean {
  return isRecord(node) && typeof node.text === 'string';
}

function isValidPlateElementNode(node: unknown): boolean {
  if (!isRecord(node) || typeof node.type !== 'string' || !Array.isArray(node.children)) {
    return false;
  }

  return node.children.every((child) => isValidPlateTextNode(child) || isValidPlateElementNode(child));
}

function normalizeSolutionContent(content: string): string {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Invalid solution content');
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidPlateElementNode)) {
    throw new Error('Invalid solution content');
  }

  return JSON.stringify(parsed);
}

function normalizeSolutionTitle(title: string | null): string | null {
  const normalizedTitle = title?.trim() || null;
  if (normalizedTitle && normalizedTitle.length > MAX_SOLUTION_TITLE_LENGTH) {
    throw new Error('Title is too long');
  }

  return normalizedTitle;
}

function normalizeSolutionStatus(status: SolutionStatus): SolutionStatus {
  if (!VALID_SOLUTION_STATUSES.has(status)) {
    throw new Error('Invalid solution status');
  }

  return status;
}

function normalizeSolutionTagNames(tagNames: string[]): string[] {
  if (!Array.isArray(tagNames)) {
    throw new Error('Invalid solution tags');
  }

  const normalizedTagNames = tagNames.reduce<string[]>((tags, tagName) => {
    if (typeof tagName !== 'string') {
      throw new Error('Invalid solution tag');
    }

    const normalizedTagName = tagName.trim().replace(/\s+/g, ' ');
    if (!normalizedTagName) {
      return tags;
    }

    if (normalizedTagName.length > MAX_TAG_NAME_LENGTH) {
      throw new Error('Tag name is too long');
    }

    const hasSameTag = tags.some(
      (tag) => tag.toLocaleLowerCase() === normalizedTagName.toLocaleLowerCase()
    );

    return hasSameTag ? tags : [...tags, normalizedTagName];
  }, []);

  if (normalizedTagNames.length > MAX_TAGS) {
    throw new Error('Too many tags');
  }

  return normalizedTagNames;
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
  const normalizedTitle = normalizeSolutionTitle(title);
  const normalizedContent = normalizeSolutionContent(content);
  const normalizedStatus = normalizeSolutionStatus(status);
  const normalizedTagNames = normalizeSolutionTagNames(tagNames);

  return prisma.$transaction(async (tx) => {
    const contestProblem = await tx.contestProblem.findUnique({
      where: {
        contestId_problemId: {
          contestId,
          problemId,
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

    let savedSolutionId = solutionId ?? null;

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
          problemId,
          contestId,
          title: normalizedTitle,
          content: normalizedContent,
          status: normalizedStatus,
        },
      });
    } else {
      const created = await tx.solution.create({
        data: {
          userId,
          problemId,
          contestId,
          title: normalizedTitle,
          content: normalizedContent,
          status: normalizedStatus,
        },
      });

      savedSolutionId = created.id;
    }

    await tx.solutionUserTag.deleteMany({
      where: { solutionId: savedSolutionId },
    });

    if (normalizedTagNames.length > 0) {
      const userTags = await Promise.all(
        normalizedTagNames.map((name) =>
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
