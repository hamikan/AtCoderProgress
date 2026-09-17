'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { parseSolutionInput } from '@/features/solutions/schemas/solution';
import type { SaveSolutionError, SaveSolutionInput } from '@/features/solutions/types';
import { prisma } from '@/lib/prisma';
import type { Result } from '@/lib/types/result';

interface SaveSolutionValue {
  solutionId: string;
}

class SolutionTargetNotFoundError extends Error {}

export async function saveSolution(
  input: SaveSolutionInput
): Promise<Result<SaveSolutionValue, SaveSolutionError>> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'ログインが必要です。' },
    };
  }

  let parsedInput: ReturnType<typeof parseSolutionInput>;
  try {
    parsedInput = parseSolutionInput(input);
  } catch {
    return {
      ok: false,
      error: { code: 'INVALID_INPUT', message: '入力内容を確認してください。' },
    };
  }

  try {
    const solutionId = await prisma.$transaction(async (transaction) => {
      const contestProblem = await transaction.contestProblem.findUnique({
        where: {
          contestId_problemId: {
            contestId: parsedInput.contestId,
            problemId: parsedInput.problemId,
          },
        },
        select: { contestId: true },
      });

      if (!contestProblem) {
        throw new SolutionTargetNotFoundError('Contest problem not found');
      }

      const savedSolutionId = parsedInput.solutionId
        ? await updateOwnedSolution(transaction, user.id, parsedInput)
        : await createSolution(transaction, user.id, parsedInput);

      await transaction.solutionUserTag.deleteMany({
        where: { solutionId: savedSolutionId },
      });

      if (parsedInput.tagNames.length > 0) {
        const userTags = await Promise.all(
          parsedInput.tagNames.map((name) =>
            transaction.userTag.upsert({
              where: { createdById_name: { createdById: user.id, name } },
              create: { createdById: user.id, name },
              update: {},
            })
          )
        );

        await transaction.solutionUserTag.createMany({
          data: userTags.map((tag) => ({
            solutionId: savedSolutionId,
            userTagId: tag.id,
          })),
        });
      }

      return savedSolutionId;
    });

    revalidatePath('/solutions');
    revalidatePath(`/solutions/${solutionId}`);
    return { ok: true, value: { solutionId } };
  } catch (error: unknown) {
    if (error instanceof SolutionTargetNotFoundError) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: '保存先の問題または解法が見つかりません。' },
      };
    }

    console.error('Failed to save solution', {
      error,
      userId: user.id,
      solutionId: parsedInput.solutionId,
    });
    return {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: '解法を保存できませんでした。' },
    };
  }
}

type Transaction = Prisma.TransactionClient;
type ParsedInput = ReturnType<typeof parseSolutionInput>;

async function updateOwnedSolution(
  transaction: Transaction,
  userId: string,
  input: ParsedInput
): Promise<string> {
  const solutionId = input.solutionId;
  if (!solutionId) {
    throw new SolutionTargetNotFoundError('Solution ID missing');
  }

  const existingSolution = await transaction.solution.findFirst({
    where: { id: solutionId, userId },
    select: { id: true },
  });
  if (!existingSolution) {
    throw new SolutionTargetNotFoundError('Solution not found');
  }

  await transaction.solution.update({
    where: { id: solutionId },
    data: {
      contestId: input.contestId,
      content: input.content,
      problemId: input.problemId,
      status: input.status,
      title: input.title,
    },
  });
  return solutionId;
}

async function createSolution(
  transaction: Transaction,
  userId: string,
  input: ParsedInput
): Promise<string> {
  const created = await transaction.solution.create({
    data: {
      contestId: input.contestId,
      content: input.content,
      problemId: input.problemId,
      status: input.status,
      title: input.title,
      userId,
    },
    select: { id: true },
  });
  return created.id;
}
