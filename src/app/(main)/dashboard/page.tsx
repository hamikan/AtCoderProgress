import { StatStrip, type StatStripItem } from '@/components/ui/stat-strip';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LinkAtCoderPrompt from '@/features/auth/components/LinkAtCoderPrompt';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { refreshAtCoderDataIfStale } from '@/features/auth/sync/refresh-atcoder-data';
import { getTagStatistics } from '@/features/problems/api/get-tag-statistics';
import TagRadar from '@/features/problems/components/TagRadar';
import { getRatingHistory } from '@/features/ratings/api/get-rating-history';
import { getRatingSummary } from '@/features/ratings/api/get-rating-summary';
import RatingGraph from '@/features/ratings/components/RatingGraph';
import { getNextRatingBand } from '@/features/ratings/functions/get-next-rating-band';
import { getRecommendedProblems } from '@/features/recommendations/api/get-recommended-problems';
import RecommendedProblems from '@/features/recommendations/components/RecommendedProblems';
import { getInProgressSolutions } from '@/features/solutions/api/get-in-progress-solutions';
import InProgressRecords from '@/features/solutions/components/InProgressRecords';
import { getRecentSubmissions } from '@/features/submissions/api/get-recent-submissions';
import { getSolvedProblemStatistics } from '@/features/submissions/api/get-solved-problem-statistics';
import RecentActivity from '@/features/submissions/components/RecentActivity';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  const atcoderAccountId = user?.atcoderAccountId;
  if (user?.atcoderId) {
    await refreshAtCoderDataIfStale(user.atcoderId);
  }
  const [
    solvedProblemStats,
    ratingSummary,
    ratingHistory,
    recentSubmissions,
    tagStats,
    inProgressSolutions,
  ] = await Promise.all([
    getSolvedProblemStatistics(atcoderAccountId),
    getRatingSummary(atcoderAccountId),
    getRatingHistory(atcoderAccountId),
    getRecentSubmissions(atcoderAccountId),
    getTagStatistics(userId, atcoderAccountId),
    getInProgressSolutions(userId),
  ]);
  const recommendedProblems = await getRecommendedProblems(
    userId,
    atcoderAccountId,
    ratingSummary.currentRating
  );

  const lastMonthSolved =
    solvedProblemStats.monthlySolved - solvedProblemStats.monthlySolvedChange;
  // 今月の AC は解き直しも数えるので、今月初めて AC した問題との差が解き直しになる
  const monthlyResolved = Math.max(
    0,
    solvedProblemStats.monthlySolved - solvedProblemStats.acCountChange
  );
  const nextBand = getNextRatingBand(ratingSummary.currentRating);
  const statItems: StatStripItem[] = [
    {
      label: 'AC',
      value: solvedProblemStats.acCount.toLocaleString(),
      notes: [`今月 +${solvedProblemStats.acCountChange.toLocaleString()}`],
    },
    {
      label: '今月のAC',
      value: solvedProblemStats.monthlySolved.toLocaleString(),
      notes: [
        `新規 ${solvedProblemStats.acCountChange.toLocaleString()}`,
        `解き直し ${monthlyResolved.toLocaleString()}`,
        `先月 ${lastMonthSolved.toLocaleString()}`,
      ],
    },
    {
      label: '連続',
      value: `${solvedProblemStats.currentStreak.toLocaleString()}日`,
      notes: [`最長 ${solvedProblemStats.longestStreak.toLocaleString()}日`],
    },
    {
      label: 'レート',
      value: ratingSummary.currentRating.toLocaleString(),
      notes: [
        ratingSummary.lastMonthRating === null
          ? null
          : `先月末 ${ratingSummary.lastMonthRating.toLocaleString()} から ${formatSigned(ratingSummary.currentRatingChange)}`,
        `最高 ${ratingSummary.highestRating.toLocaleString()}`,
        nextBand ? `あと ${nextBand.pointsNeeded} で${nextBand.colorName}` : null,
      ].filter((note): note is string => note !== null),
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {!user && (
          <div className="mb-6">
            <LoginPrompt returnTo="/dashboard" />
          </div>
        )}
        {user && !user.atcoderId && (
          <div className="mb-6">
            <LinkAtCoderPrompt />
          </div>
        )}
        <StatStrip items={statItems} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2 lg:space-y-8">
            <RatingGraph data={ratingHistory} />
            <InProgressRecords records={inProgressSolutions} />
            <RecentActivity activities={recentSubmissions} />
          </div>
          <div className="space-y-4 lg:space-y-8">
            <RecommendedProblems data={recommendedProblems} />
            <TagRadar initialStats={tagStats} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSigned(value: number): string {
  if (value === 0) return '±0';
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toLocaleString()}`;
}
