import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { NextResponse } from 'next/server';
import { getSolutionByProblemId, getProblemDetail } from '@/lib/services/db/solution';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { problemId } = await params;

  const [problem, solution] = await Promise.all([
    getProblemDetail(problemId),
    getSolutionByProblemId(session.user.id, problemId),
  ]);

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  return NextResponse.json({ problem, solution });
}
