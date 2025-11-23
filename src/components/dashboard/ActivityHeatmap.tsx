'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { HeatmapDay } from '@/lib/activity-heatmap';

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      result.push(data.slice(i, i + 7));
    }
    return result;
  }, [data]);
  
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

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg font-semibold text-slate-900">
            精進カレンダー
          </CardTitle>
        </div>
        <p className="text-sm text-slate-600">
          過去1年間の学習活動を可視化
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month labels */}
          <div className="flex justify-between text-xs text-slate-500 px-4">
            {months.map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex space-x-1">
            {/* Weekday labels */}
            <div className="flex flex-col space-y-1 pr-2">
              {weekdays.map((day, index) => (
                <div
                  key={index}
                  className="h-3 w-6 flex items-center justify-center text-xs text-slate-500"
                >
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* Activity squares */}
            <div className="flex space-x-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`h-3 w-3 rounded-sm ${getIntensityClass(day.level)} hover:ring-2 hover:ring-slate-400 cursor-pointer transition-all`}
                      title={`${day.date}: ${day.count}問解答`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>少ない</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-3 w-3 rounded-sm ${getIntensityClass(level)}`}
                />
              ))}
            </div>
            <span>多い</span>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">247</div>
              <div className="text-xs text-slate-600">今年の総AC数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">15</div>
              <div className="text-xs text-slate-600">最長連続日数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">3.2</div>
              <div className="text-xs text-slate-600">1日平均AC数</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
