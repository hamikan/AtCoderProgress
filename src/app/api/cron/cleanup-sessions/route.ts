import { deleteExpiredSessions } from '@/features/auth/sync/delete-expired-sessions';
import { isAuthorizedCronRequest } from '@/lib/cron/authorize';
import { createLogger } from '@/lib/logger';

const logger = createLogger('session-cleanup');

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request.headers.get('authorization'), process.env.CRON_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const deletedCount = await deleteExpiredSessions();
    logger.info('finished', { deletedCount });
    return Response.json({ ok: true, deletedCount });
  } catch (error: unknown) {
    logger.error('failed', { error });
    return Response.json({ ok: false }, { status: 500 });
  }
}
