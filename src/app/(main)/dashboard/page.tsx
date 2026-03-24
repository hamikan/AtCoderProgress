
import StatsOverview from '@/components/dashboard/StatsOverview';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import TagRadar from '@/components/dashboard/TagRadar';
import RecommendedProblems from '@/components/dashboard/RecommendedProblems';
import RecentActivity from '@/components/dashboard/RecentActivity';
import RatingGraph from '@/components/dashboard/RatingGraph';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { getUserStats, getRatingHistoryData, getHeatmapData, getRecentActivity, getTagStats, getRecommendedProblems } from '@/lib/services/db/stats';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [stats, ratingHistory, heatmapData, recentActivity, tagStats, recommendedProblems] = await Promise.all([
    getUserStats(userId),
    getRatingHistoryData(userId),
    getHeatmapData(userId),
    getRecentActivity(userId),
    getTagStats(userId),
    getRecommendedProblems(userId),
  ]);

  const overviewStats = {
    acCount: {
      value: stats.acCount,
      change: stats.acCountChange,
      changeType: 'increase' as const
    },
    rating: {
      value: stats.currentRating,
      change: stats.currentRatingChange,
      changeType: stats.currentRatingChange >= 0 ? 'increase' as const : 'decrease' as const
    },
    monthlySolved: {
      value: stats.monthlySolved,
      change: stats.monthlySolvedChange,
      changeType: stats.monthlySolvedChange >= 0 ? 'increase' as const : 'decrease' as const
    },
    streak: {
      value: stats.currentStreak,
    },
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">

      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            <StatsOverview stats={overviewStats} />
            <RatingGraph data={ratingHistory} />
            <ActivityHeatmap data={heatmapData} />
            <RecentActivity activities={recentActivity} />
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-4 lg:space-y-8">
            <RecommendedProblems data={recommendedProblems} />
            <TagRadar initialStats={tagStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
