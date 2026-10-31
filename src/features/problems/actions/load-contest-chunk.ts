'use server';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { getContestChunk } from '@/features/problems/api/get-contest-chunk';
import {
  isContestKind,
  isContestOrder,
  isValidContestCursor,
} from '@/features/problems/functions/contest-page-params';
import type { ContestChunkInput, ContestPageResult } from '@/features/problems/types';

export async function loadContestChunk(
  input: ContestChunkInput
): Promise<ContestPageResult> {
  const { contestType, order, cursor } = input;

  if (!isContestKind(contestType)) {
    throw new Error(`Invalid contest type: ${contestType}`);
  }
  if (!isContestOrder(order)) {
    throw new Error(`Invalid contest order: ${order}`);
  }
  if (!isValidContestCursor(cursor, contestType)) {
    throw new Error(`Invalid contest cursor: ${cursor}`);
  }

  const user = await getCurrentUser();

  return getContestChunk(contestType, order, {
    cursor,
    userId: user?.id,
  });
}
