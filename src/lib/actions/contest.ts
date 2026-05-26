'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import {
  isContestKind,
  isContestOrder,
  parseContestPageSize,
  validateContestCursor,
} from '@/lib/services/db/contest-pagination';
import { getContestPageWithSubmissions, type ContestPageResult } from '@/lib/services/db/contest';

interface LoadContestPageInput {
  contestType: string;
  order: string;
  cursor: string | null;
  limit?: number;
}

export async function loadContestPageAction(input: LoadContestPageInput): Promise<ContestPageResult> {
  const contestType = input.contestType.toLowerCase();
  const order = input.order;
  const pageSize = parseContestPageSize(input.limit ? String(input.limit) : null);

  if (!isContestKind(contestType)) {
    throw new Error('Invalid contestType');
  }

  if (!isContestOrder(order)) {
    throw new Error('Invalid order');
  }

  if (pageSize === null) {
    throw new Error('Invalid limit');
  }

  if (!validateContestCursor(input.cursor, contestType)) {
    throw new Error('Invalid cursor');
  }

  const session = await getServerSession(authOptions);
  return getContestPageWithSubmissions(contestType, order, {
    cursor: input.cursor,
    pageSize,
    userId: session?.user?.id ?? undefined,
  });
}
