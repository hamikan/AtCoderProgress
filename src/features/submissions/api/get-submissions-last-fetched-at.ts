import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getSubmissionsLastFetchedAt(
  atcoderAccountId: string
): Promise<Date | null> {
  const account = await prisma.atCoderAccount.findUnique({
    where: { id: atcoderAccountId },
    select: { submissionsLastFetchedAt: true },
  });
  return account?.submissionsLastFetchedAt ?? null;
}
