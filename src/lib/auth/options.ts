import 'server-only';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { PrismaClient } from '@prisma/client';
import type { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { getRequiredAuthEnvironmentVariable } from '@/lib/auth/environment';
import type { AuthEnvironment } from '@/lib/auth/environment';
import { prisma } from '@/lib/prisma';

export function createAuthOptions(
  environment: AuthEnvironment = process.env
): NextAuthOptions {
  return {
    // Prisma 7 の生成クライアントは @next-auth/prisma-adapter が想定する
    // @prisma/client の PrismaClient 型と generics が一致しないためキャストする
    // （実行時に使う delegate API は互換）
    adapter: PrismaAdapter(prisma as unknown as PrismaClient),
    providers: [
      GithubProvider({
        clientId: getRequiredAuthEnvironmentVariable('GITHUB_ID', environment),
        clientSecret: getRequiredAuthEnvironmentVariable('GITHUB_SECRET', environment),
      }),
    ],
    secret: getRequiredAuthEnvironmentVariable('NEXTAUTH_SECRET', environment),
    pages: {
      signIn: '/login',
    },
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
          session.user.atcoderId = user.atcoderId;
        }
        return session;
      },
    },
  };
}
