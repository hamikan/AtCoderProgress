import 'server-only';

import { getServerSession } from 'next-auth/next';
import { connection } from 'next/server';

import { createAuthOptions } from '@/lib/auth/options';

export async function getAuthSession() {
  await connection();
  return getServerSession(createAuthOptions());
}
