import 'server-only';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import type { Adapter, AdapterAccount } from 'next-auth/adapters';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { getRequiredAuthEnvironmentVariable } from '@/lib/auth/environment';
import type { AuthEnvironment } from '@/lib/auth/environment';
import { stripOAuthTokens } from '@/lib/auth/strip-oauth-tokens';
import { pickVerifiedGitHubEmail, type GitHubEmail } from '@/lib/auth/verified-email';
import { prisma } from '@/lib/prisma';

function createAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma);
  return {
    ...adapter,
    linkAccount: (account: AdapterAccount) => adapter.linkAccount?.(stripOAuthTokens(account)),
  };
}

export function createAuthOptions(
  environment: AuthEnvironment = process.env
): NextAuthOptions {
  return {
    adapter: createAdapter(),
    // メールアドレスが同じなら、どちらの方法でも同じアカウントに入れる。他人のアカウントに入れないよう、確認済みのアドレスだけを使う
    providers: [
      GithubProvider({
        clientId: getRequiredAuthEnvironmentVariable('GITHUB_ID', environment),
        clientSecret: getRequiredAuthEnvironmentVariable('GITHUB_SECRET', environment),
        allowDangerousEmailAccountLinking: true,
        userinfo: {
          url: 'https://api.github.com/user',
          async request({ client, tokens }) {
            const profile = await client.userinfo(tokens.access_token ?? '');
            const response = await fetch('https://api.github.com/user/emails', {
              headers: { Authorization: `token ${tokens.access_token}` },
            });
            const emails = response.ok ? ((await response.json()) as GitHubEmail[]) : [];
            return { ...profile, email: pickVerifiedGitHubEmail(emails) ?? undefined };
          },
        },
      }),
      GoogleProvider({
        clientId: getRequiredAuthEnvironmentVariable('GOOGLE_ID', environment),
        clientSecret: getRequiredAuthEnvironmentVariable('GOOGLE_SECRET', environment),
        allowDangerousEmailAccountLinking: true,
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email_verified ? profile.email : null,
            image: profile.picture,
          };
        },
      }),
    ],
    secret: getRequiredAuthEnvironmentVariable('NEXTAUTH_SECRET', environment),
    pages: {
      signIn: '/login',
      // 指定しないと、設定の誤りや拒否のときに NextAuth の英語のページが出る
      error: '/login',
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
