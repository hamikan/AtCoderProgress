import 'server-only';

import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth/options';
import type { CurrentUser } from '@/features/auth/types';

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    atcoderId: user.atcoderId ?? null,
  };
}
