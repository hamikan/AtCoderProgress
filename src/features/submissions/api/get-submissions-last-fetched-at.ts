import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getSubmissionsLastFetchedAt(userId: string): Promise<Date | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { submissionsLastFetchedAt: true },
  });
  return user?.submissionsLastFetchedAt ?? null;
}
