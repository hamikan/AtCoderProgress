import 'server-only';

import type { CurrentUser } from '@/features/auth/types';
import { toAtCoderAccountId } from '@/lib/atcoder/user-id';
import { getAuthSession } from '@/lib/auth/session';

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getAuthSession();
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  const atcoderId = user.atcoderId ?? null;
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    atcoderId,
    atcoderAccountId: atcoderId ? toAtCoderAccountId(atcoderId) : null,
  };
}
