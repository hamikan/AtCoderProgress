import { syncContestsAndProblems } from '@/features/problems/sync/sync-contests-and-problems';
import { createLogger } from '@/lib/logger';
import { isAuthorizedCronRequest } from '@/lib/cron/authorize';

const logger = createLogger('problem-sync');

export const dynamic = 'force-dynamic';
// 空の DB への最初の取り込みは、全件を足すので時間がかかる
export const maxDuration = 300;

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await syncContestsAndProblems();
    return Response.json({ ok: true, result });
  } catch (error: unknown) {
    logger.error('failed', { error });
    return Response.json({ ok: false }, { status: 500 });
  }
}
