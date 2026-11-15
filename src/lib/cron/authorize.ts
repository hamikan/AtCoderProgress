import { timingSafeEqual } from 'node:crypto';

/**
 * Vercel の定期実行は、環境変数 CRON_SECRET があると `Authorization: Bearer <CRON_SECRET>` を付けて呼ぶ。
 * 秘密が設定されていないときは、誰でも呼べてしまうので必ず断る。
 */
export function isAuthorizedCronRequest(
  authorizationHeader: string | null,
  cronSecret: string | undefined
): boolean {
  if (!cronSecret || !authorizationHeader) {
    return false;
  }
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const actual = Buffer.from(authorizationHeader);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
