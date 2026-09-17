import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';

import { createAuthOptions } from '@/lib/auth/options';

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

function handler(request: NextRequest, context: AuthRouteContext) {
  return NextAuth(request, context, createAuthOptions());
}

export { handler as GET, handler as POST };
