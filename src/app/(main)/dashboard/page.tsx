import StatsOverview from '@/components/dashboard/StatsOverview';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import AlgorithmRadar from '@/components/dashboard/AlgorithmRadar';
import RecommendedProblems from '@/components/dashboard/RecommendedProblems';
import RecentActivity from '@/components/dashboard/RecentActivity';
import WeaknessAnalysis from '@/components/dashboard/WeaknessAnalysis';
import { generateHeatmapData } from '@/lib/activity-heatmap';

export default async function Dashboard() {
  const heatmapData = generateHeatmapData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <StatsOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RecommendedProblems />
            <ActivityHeatmap data={heatmapData} />
            <RecentActivity />
          </div>
          <div className="space-y-8">
            <AlgorithmRadar />
            <WeaknessAnalysis />
          </div>
        </div>
      </main>
    </div>
  );
}
