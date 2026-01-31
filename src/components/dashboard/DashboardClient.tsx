'use client';

import { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Submission } from '@/types/submission';

interface DashboardClientProps {
  submissions: Submission[];
  userName?: string | null;
  atcoderId?: string | null;
}

export default function DashboardClient({ submissions, userName, atcoderId }: DashboardClientProps) {
  // 提出データを日付ごとのカウントに加工
  const dailyCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    submissions.forEach(submission => {
      if (submission.result === 'AC') {
        const date = new Date(submission.epochSecond * 1000);
        const dateString = date.toISOString().split('T')[0];
        counts[dateString] = (counts[dateString] || 0) + 1;
      }
    });
    return Object.keys(counts).map(date => ({
      date: new Date(date),
      count: counts[date],
    }));
  }, [submissions]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">ようこそ、{userName ?? 'ゲスト'}さん！</h1>
      <p className="text-xl text-gray-700">あなたのAtCoder ID: {atcoderId ?? '-'}</p>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">学習のサマリー</h2>
        <h3 className="text-xl font-medium mb-2">カレンダーヒートマップ</h3>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={dailyCounts}
            classForValue={(value: { date: string; count: number } | null) => {
              if (!value) return 'color-empty';
              if (value.count === 0) return 'color-empty';
              if (value.count < 3) return 'color-scale-1';
              if (value.count < 6) return 'color-scale-2';
              if (value.count < 10) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value: { date: string; count: number } | null) => {
              if (!value || !value.date) {
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': 'No submissions',
                };
              }
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${value.date}: ${value.count} submissions`,
              };
            }}
            showWeekdayLabels={true}
          />
          <ReactTooltip id="heatmap-tooltip" /> */}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-medium mb-2">アルゴリズムタグごとのAC数レーダーチャート</h3>
          <p>（ここにレーダーチャートが表示されます）</p>
        </div>
      </div>
    </div>
  );
}
