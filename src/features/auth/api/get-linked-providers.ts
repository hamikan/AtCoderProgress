import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getLinkedProviders(userId: string): Promise<string[]> {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });

  return accounts.map((account) => account.provider);
}
