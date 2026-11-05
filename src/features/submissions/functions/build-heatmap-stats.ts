import type {
  AcceptedProblemHeatmapDay,
  HeatmapStats,
} from '@/features/submissions/types';

export function buildHeatmapStats(
  data: readonly AcceptedProblemHeatmapDay[]
): HeatmapStats {
  const totalAC = data.reduce((sum, day) => sum + day.count, 0);
  const dailyAverage =
    data.length > 0 ? (totalAC / data.length).toFixed(1) : '0.0';

  let maxStreak = 0;
  let currentStreak = 0;

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const day of sortedData) {
    if (day.count > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return { totalAC, maxStreak, dailyAverage };
}
