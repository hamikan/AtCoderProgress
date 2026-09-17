import 'server-only';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { getRequiredAuthEnvironmentVariable } from '@/lib/auth/environment';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: getRequiredAuthEnvironmentVariable('GITHUB_ID'),
      clientSecret: getRequiredAuthEnvironmentVariable('GITHUB_SECRET'),
    }),
  ],
  secret: getRequiredAuthEnvironmentVariable('NEXTAUTH_SECRET'),
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
} satisfies NextAuthOptions;
