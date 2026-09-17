import { Calendar, Target, TrendingUp, Trophy } from 'lucide-react';

import { StatCard } from '@/components/ui/stat-card';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getTagStatistics } from '@/features/problems/api/get-tag-statistics';
import TagRadar from '@/features/problems/components/TagRadar';
import { getRatingHistory } from '@/features/ratings/api/get-rating-history';
import { getRatingSummary } from '@/features/ratings/api/get-rating-summary';
import RatingGraph from '@/features/ratings/components/RatingGraph';
import { getRecommendedProblems } from '@/features/recommendations/api/get-recommended-problems';
import RecommendedProblems from '@/features/recommendations/components/RecommendedProblems';
import { getAcceptedProblemHeatmap } from '@/features/submissions/api/get-accepted-problem-heatmap';
import { getRecentSubmissions } from '@/features/submissions/api/get-recent-submissions';
import { getSolvedProblemStatistics } from '@/features/submissions/api/get-solved-problem-statistics';
import ActivityHeatmap from '@/features/submissions/components/ActivityHeatmap';
import RecentActivity from '@/features/submissions/components/RecentActivity';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  const [
    solvedProblemStats,
    ratingSummary,
    ratingHistory,
    acceptedProblemHeatmap,
    recentSubmissions,
    tagStats,
  ] = await Promise.all([
    getSolvedProblemStatistics(userId),
    getRatingSummary(userId),
    getRatingHistory(userId),
    getAcceptedProblemHeatmap(userId),
    getRecentSubmissions(userId),
    getTagStatistics(userId),
  ]);
  const recommendedProblems = await getRecommendedProblems(
    userId,
    ratingSummary.currentRating
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {!user && (
          <div className="mb-6">
            <LoginPrompt returnTo="/dashboard" />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="AC数"
            value={solvedProblemStats.acCount}
            change={solvedProblemStats.acCountChange}
            icon={Trophy}
            iconClassName="text-amber-600"
            iconBackgroundClassName="bg-amber-50"
          />
          <StatCard
            title="現在レート"
            value={ratingSummary.currentRating}
            change={ratingSummary.currentRatingChange}
            icon={TrendingUp}
            iconClassName="text-emerald-600"
            iconBackgroundClassName="bg-emerald-50"
          />
          <StatCard
            title="今月の精進"
            value={solvedProblemStats.monthlySolved}
            change={solvedProblemStats.monthlySolvedChange}
            icon={Target}
            iconClassName="text-blue-600"
            iconBackgroundClassName="bg-blue-50"
          />
          <StatCard
            title="連続精進日数"
            value={solvedProblemStats.currentStreak}
            icon={Calendar}
            iconClassName="text-purple-600"
            iconBackgroundClassName="bg-purple-50"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2 lg:space-y-8">
            <RatingGraph data={ratingHistory} />
            <ActivityHeatmap data={acceptedProblemHeatmap} />
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
