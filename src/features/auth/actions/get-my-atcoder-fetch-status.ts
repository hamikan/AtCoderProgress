'use server';

import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { getLinkedAtCoderFetchStatus } from '@/features/auth/api/get-linked-atcoder-fetch-status';
import type { AtCoderFetchStatus } from '@/features/auth/types';

export async function getMyAtCoderFetchStatus(): Promise<AtCoderFetchStatus | null> {
  const user = await getCurrentUser();
  return getLinkedAtCoderFetchStatus(user?.atcoderAccountId);
}
