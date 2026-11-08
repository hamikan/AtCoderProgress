import 'server-only';

import type { UnlinkProviderResult } from '@/features/auth/types';

interface ProviderAccountReader {
  account: {
    findMany(args: {
      select: { provider: true };
      where: { userId: string };
    }): Promise<Array<{ provider: string }>>;
  };
}

type ProviderAccountTransaction = ProviderAccountReader & {
  account: {
    deleteMany(args: {
      where: { provider: string; userId: string };
    }): Promise<unknown>;
  };
};

export async function unlinkProvider(
  transaction: ProviderAccountTransaction,
  userId: string,
  provider: string
): Promise<UnlinkProviderResult> {
  const accounts = await transaction.account.findMany({
    select: { provider: true },
    where: { userId },
  });
  if (!accounts.some((account) => account.provider === provider)) {
    return { status: 'not-linked' };
  }
  if (accounts.length <= 1) {
    return { status: 'last-provider' };
  }
  await transaction.account.deleteMany({ where: { provider, userId } });
  return { status: 'unlinked' };
}
