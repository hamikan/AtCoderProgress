export async function register(): Promise<void> {
  // ビルドのときは環境変数がそろっていなくてよい（CI は何も設定せずにビルドする）
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  const { assertServerEnvironment } = await import('@/lib/env');
  assertServerEnvironment();
}
