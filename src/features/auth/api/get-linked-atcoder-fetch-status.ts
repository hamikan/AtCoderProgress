import 'server-only';

import { getAtCoderFetchStatus } from '@/features/auth/functions/atcoder-fetch-status';
import type { AtCoderFetchStatus } from '@/features/auth/types';
import { prisma } from '@/lib/prisma';

export async function getLinkedAtCoderFetchStatus(
  atcoderAccountId: string | null | undefined
): Promise<AtCoderFetchStatus | null> {
  if (!atcoderAccountId) {
    return null;
  }
  const account = await prisma.atCoderAccount.findUnique({
    where: { id: atcoderAccountId },
    select: {
      submissionsLastFetchedAt: true,
      fetchStartedAt: true,
      fetchFailedAt: true,
    },
  });
  return getAtCoderFetchStatus(account, new Date());
}
