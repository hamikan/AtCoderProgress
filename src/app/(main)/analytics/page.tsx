import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getAccountJourneyAnalytics } from '@/features/ratings/api/get-account-journey-analytics';
import AccountJourney from '@/features/ratings/components/AccountJourney';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const analytics = await getAccountJourneyAnalytics(user?.id);

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
        {!user && <LoginPrompt returnTo="/analytics" />}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Analytics</p>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950">
            アカウント遍歴
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            レート帯ごとの挑戦内容、教材セットの到達度、直近パフォーマンスから見た現在レートの噛み合いをまとめます。
          </p>
        </div>
        <AccountJourney data={analytics} />
      </div>
    </div>
  );
}
