
import StatsOverview from '@/components/dashboard/StatsOverview';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import TagRadar from '@/components/dashboard/TagRadar';
import RecommendedProblems from '@/components/dashboard/RecommendedProblems';
import RecentActivity from '@/components/dashboard/RecentActivity';
// import { generateHeatmapData } from '@/lib/activity-heatmap'; // Use real data instead
import RatingGraph from '@/components/dashboard/RatingGraph';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { getUserStats, getRatingHistoryData, getHeatmapData, getRecentActivity, getTagStats } from '@/lib/services/db/stats';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch all data in parallel
  const [stats, ratingHistory, heatmapData, recentActivity, tagStats] = await Promise.all([
    getUserStats(userId),
    getRatingHistoryData(userId),
    getHeatmapData(userId),
    getRecentActivity(userId),
    getTagStats(userId)
  ]);

  // Map Real Stats to StatsOverview Props
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
      change: '継続中',
      changeType: 'neutral' as const
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content (2/3) */}
          <div className="xl:col-span-2 space-y-8">
            <StatsOverview stats={overviewStats} />
            <RatingGraph data={ratingHistory} />
            <ActivityHeatmap data={heatmapData} />
            <RecentActivity activities={recentActivity} />
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-8">
            <RecommendedProblems />
            <TagRadar initialStats={tagStats} />
          </div>
        </div>
      </main>
    </div>
  );
}
