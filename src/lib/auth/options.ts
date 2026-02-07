import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { syncSubmission } from "@/lib/services/sync/submission";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  events: {
    async signIn({ user }) {
      const u = user as any;
      if (u.id && u.atcoderId) {
        syncSubmission(u.id, u.atcoderId, 0).catch(err => {
          console.error("Login-time sync failed:", err);
        });
      }
    }
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
