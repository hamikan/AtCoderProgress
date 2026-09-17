import 'server-only';

import type { CurrentUser } from '@/features/auth/types';
import { getAuthSession } from '@/lib/auth/session';

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getAuthSession();
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
