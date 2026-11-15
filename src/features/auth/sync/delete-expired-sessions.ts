import 'server-only';

import { prisma } from '@/lib/prisma';

// NextAuth は、期限切れのセッションを同じクッキーが戻ってきたときにしか消さない。戻ってこない分が溜まり続けるので、まとめて消す
export async function deleteExpiredSessions(now: Date = new Date()): Promise<number> {
  const { count } = await prisma.session.deleteMany({ where: { expires: { lt: now } } });
  return count;
}
