import 'server-only';

import {
  decideAtCoderIdChange,
  getAtCoderIdFetchIntervalStart,
} from '@/features/auth/functions/atcoder-id-change-policy';
import type { ApplyAtCoderIdChangeResult } from '@/features/auth/types';
import { toAtCoderAccountId } from '@/lib/atcoder/user-id';

interface UserAtCoderIdReader {
  user: {
    findUnique(args: {
      select: { atcoderId: true };
      where: { id: string };
    }): Promise<{ atcoderId: string | null } | null>;
  };
  atCoderIdFetch: {
    findMany(args: {
      select: { createdAt: true };
      where: { userId: string; createdAt: { gt: Date } };
    }): Promise<Array<{ createdAt: Date }>>;
  };
}

type UserAtCoderIdTransaction = UserAtCoderIdReader & {
  user: {
    update(args: {
      data: {
        atcoderId: string;
        atcoderIdChangedAt: Date;
      };
      where: { id: string };
    }): Promise<unknown>;
  };
  atCoderAccount: {
    upsert(args: {
      create: { id: string; name: string; fetchStartedAt: Date | null };
      select: { name: true };
      update: { fetchStartedAt?: Date; fetchFailedAt?: null };
      where: { id: string };
    }): Promise<{ name: string }>;
  };
  atCoderIdFetch: {
    create(args: {
      data: { userId: string; atcoderAccountId: string };
    }): Promise<unknown>;
  };
};

async function readAtCoderIdChange(
  reader: UserAtCoderIdReader,
  userId: string,
  nextAtCoderId: string,
  needsFetch: boolean,
  now: Date
) {
  const [user, recentFetches] = await Promise.all([
    reader.user.findUnique({
      where: { id: userId },
      select: { atcoderId: true },
    }),
    reader.atCoderIdFetch.findMany({
      where: { userId, createdAt: { gt: getAtCoderIdFetchIntervalStart(now) } },
      select: { createdAt: true },
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  return decideAtCoderIdChange({
    currentAtCoderId: user.atcoderId,
    nextAtCoderId,
    needsFetch,
    recentFetchTimes: recentFetches.map((fetch) => fetch.createdAt),
    now,
  });
}

export async function getAtCoderIdChangeDecision(
  reader: UserAtCoderIdReader,
  userId: string,
  nextAtCoderId: string,
  needsFetch: boolean,
  now: Date
) {
  return readAtCoderIdChange(reader, userId, nextAtCoderId, needsFetch, now);
}

// 全件の取得はここではしない。startFetch のときは取得中の印を付けて記録し、取得は呼び出し側が裏で始める
export async function applyAtCoderIdChange(
  transaction: UserAtCoderIdTransaction,
  userId: string,
  nextAtCoderId: string,
  now: Date,
  startFetch: boolean
): Promise<ApplyAtCoderIdChangeResult> {
  const decision = await readAtCoderIdChange(
    transaction,
    userId,
    nextAtCoderId,
    startFetch,
    now
  );
  if (decision.status !== 'allowed') {
    return decision;
  }

  const atcoderAccountId = toAtCoderAccountId(nextAtCoderId);
  const account = await transaction.atCoderAccount.upsert({
    where: { id: atcoderAccountId },
    create: {
      id: atcoderAccountId,
      name: nextAtCoderId,
      fetchStartedAt: startFetch ? now : null,
    },
    update: startFetch ? { fetchStartedAt: now, fetchFailedAt: null } : {},
    select: { name: true },
  });

  if (startFetch) {
    await transaction.atCoderIdFetch.create({
      data: { userId, atcoderAccountId },
    });
  }

  await transaction.user.update({
    where: { id: userId },
    data: {
      atcoderId: account.name,
      atcoderIdChangedAt: now,
    },
  });

  return { status: 'changed' };
}
