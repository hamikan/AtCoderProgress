import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import AccountJourney from '@/components/analytics/AccountJourney';
import { authOptions } from '@/lib/auth/options';
import { getAccountJourneyAnalytics } from '@/lib/services/db/stats';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const analytics = await getAccountJourneyAnalytics(session.user.id);

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Analytics</p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-normal text-slate-950">
                アカウント遍歴
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                レート帯ごとの挑戦内容、教材セットの到達度、直近パフォーマンスから見た現在レートの噛み合いをまとめます。
              </p>
            </div>
          </div>
        </div>

        <AccountJourney data={analytics} />
      </div>
    </div>
  );
}
