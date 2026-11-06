import { StatCard } from '@/components/ui/stat-card';
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
import { getAcceptedProblemHeatmap } from '@/features/submissions/api/get-accepted-problem-heatmap';
import { getRecentSubmissions } from '@/features/submissions/api/get-recent-submissions';
import { getSolvedProblemStatistics } from '@/features/submissions/api/get-solved-problem-statistics';
import RecentActivity from '@/features/submissions/components/RecentActivity';
import { buildHeatmapStats } from '@/features/submissions/functions/build-heatmap-stats';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (userId) {
    await refreshAtCoderDataIfStale(userId);
  }
  const [
    solvedProblemStats,
    ratingSummary,
    ratingHistory,
    acceptedProblemHeatmap,
    recentSubmissions,
    tagStats,
    inProgressSolutions,
  ] = await Promise.all([
    getSolvedProblemStatistics(userId),
    getRatingSummary(userId),
    getRatingHistory(userId),
    getAcceptedProblemHeatmap(userId),
    getRecentSubmissions(userId),
    getTagStatistics(userId),
    getInProgressSolutions(userId),
  ]);
  const recommendedProblems = await getRecommendedProblems(
    userId,
    ratingSummary.currentRating
  );

  const heatmapStats = buildHeatmapStats(acceptedProblemHeatmap);
  const lastMonthSolved =
    solvedProblemStats.monthlySolved - solvedProblemStats.monthlySolvedChange;
  const nextBand = getNextRatingBand(ratingSummary.currentRating);
  const ratingDetail = [
    `最高 ${ratingSummary.highestRating.toLocaleString()}`,
    nextBand ? `あと ${nextBand.pointsNeeded} で${nextBand.colorName}` : null,
  ]
    .filter(Boolean)
    .join(' ・ ');

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="AC数"
            value={solvedProblemStats.acCount}
            change={solvedProblemStats.acCountChange}
            changeLabel="今月の新規AC"
          />
          <StatCard
            title="現在レート"
            value={ratingSummary.currentRating}
            change={ratingSummary.currentRatingChange}
            changeLabel={
              ratingSummary.lastMonthRating === null
                ? undefined
                : `先月最終 ${ratingSummary.lastMonthRating.toLocaleString()}`
            }
            detail={ratingDetail}
          />
          <StatCard
            title="今月のAC数"
            value={solvedProblemStats.monthlySolved}
            change={`先月 ${lastMonthSolved.toLocaleString()}`}
          />
          <StatCard
            title="連続精進日数"
            value={solvedProblemStats.currentStreak}
            detail={`最長 ${heatmapStats.maxStreak}日`}
          />
        </div>

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
