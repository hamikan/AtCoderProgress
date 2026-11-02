import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { buildHeatmapStats } from '@/features/submissions/functions/build-heatmap-stats';
import type { AcceptedProblemHeatmapDay } from '@/features/submissions/types';

interface ActivityHeatmapProps {
  data: AcceptedProblemHeatmapDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const weeks = Array.from(
    { length: Math.ceil(data.length / 7) },
    (_, index) => data.slice(index * 7, index * 7 + 7)
  );

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-slate-100';
      case 1:
        return 'bg-emerald-200';
      case 2:
        return 'bg-emerald-400';
      case 3:
        return 'bg-emerald-600';
      case 4:
        return 'bg-emerald-800';
      default:
        return 'bg-slate-100';
    }
  };

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  const stats = buildHeatmapStats(data);

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg font-semibold text-slate-900">
            精進カレンダー
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap grid */}
          <div className="flex flex-col w-full">
            {/* Month labels */}
            <div className="flex w-full pl-6 mb-1 h-5 gap-[2px]">
              {weeks.map((week, index) => {
                const firstDayOfMonth = week.find(d => {
                  const date = new Date(d.date);
                  return date.getDate() === 1;
                });

                return (
                  <div key={index} className="flex-1 relative">
                    {firstDayOfMonth && (
                      <span className="absolute left-0 bottom-0 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(firstDayOfMonth.date).getMonth() + 1}月
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex w-full gap-[2px]">
              {/* Weekday labels */}
              <div className="flex flex-col space-y-1 pr-2 w-6 shrink-0">
                {weekdays.map((day, index) => (
                  <div
                    key={index}
                    className="h-[10px] flex items-center justify-center text-[10px] text-slate-500 leading-none"
                    style={{ height: 'calc(100% / 7 - 1px)' }} // approximate alignment
                  >
                    {index % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>

              {/* Activity squares */}
              <div className="flex w-full gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col flex-1 gap-[2px]">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-full aspect-square rounded-sm ${getIntensityClass(day.level)} hover:ring-2 hover:ring-slate-400 cursor-pointer transition-all`}
                        title={`${day.date}: ${day.count}問解答`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend: labels are the per-day AC counts behind each color level */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>1日のAC数</span>
            <div className="flex items-end space-x-2">
              {[
                { level: 0, label: '0' },
                { level: 1, label: '1' },
                { level: 2, label: '2–3' },
                { level: 3, label: '4–5' },
                { level: 4, label: '6+' },
              ].map(({ level, label }) => (
                <div key={level} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-3 w-3 rounded-sm ${getIntensityClass(level)}`}
                  />
                  <span className="text-[10px] leading-none">{label}</span>
                </div>
              ))}
            </div>
            <span>問</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">{stats.totalAC}</div>
              <div className="text-xs text-slate-600">表示期間の総AC数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">{stats.maxStreak}</div>
              <div className="text-xs text-slate-600">最長連続日数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">{stats.dailyAverage}</div>
              <div className="text-xs text-slate-600">1日平均AC数</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
