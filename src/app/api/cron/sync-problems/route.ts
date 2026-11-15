import { syncContestsAndProblems } from '@/features/problems/sync/sync-contests-and-problems';
import { isAuthorizedCronRequest } from '@/lib/cron/authorize';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await syncContestsAndProblems();
    return Response.json({ ok: true, result });
  } catch (error: unknown) {
    console.error('[problem-sync] failed', error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
