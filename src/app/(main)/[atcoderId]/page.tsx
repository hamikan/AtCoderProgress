'use client'

import { notFound } from 'next/navigation';
import { Radar } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);


// 仮のデータ構造
const dummyData = {
  totalAc: 1234,
  estimatedRate: 2345,
  totalDifficulty: 567890,
  calendarData: [
    { date: '2024-01-01', count: 3 },
    { date: '2024-01-02', count: 5 },
    // ... more data
  ],
  radarChartData: {
    labels: ['DP', 'Data Structures', 'Graph Theory', 'Math', 'Greedy', 'Search'],
    datasets: [
      {
        label: 'AC Count',
        data: [65, 59, 90, 81, 56, 55],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
      }
    ]
  }
};

async function getUserProfile(atcoderId: string) {
  // 実際のAPI呼び出しに置き換える
  return dummyData;
}

export default async function UserProfilePage({ params }: { params: { atcoderId: string } }) {
  const { atcoderId } = params;
  const userProfile = await getUserProfile(atcoderId);

  if (!userProfile) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <a href="/" style={{ display: 'block', marginBottom: '20px', color: '#0070f3', textDecoration: 'none' }}>
        &larr; ホームに戻る
      </a>
      <h1 style={{ fontSize: '2.5em', marginBottom: '25px' }}>{atcoderId}さんのダッシュボード</h1>

      {/* 主要指標 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2em', margin: '0 0 10px' }}>生涯AC数</h2>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>{userProfile.totalAc}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2em', margin: '0 0 10px' }}>現在の推定レート</h2>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>{userProfile.estimatedRate}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2em', margin: '0 0 10px' }}>Difficulty合計値</h2>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>{userProfile.totalDifficulty}</p>
        </div>
      </div>

      {/* 学習のサマリー */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <h2 style={{ fontSize: '1.5em', marginBottom: '20px' }}>学習カレンダー</h2>
          <CalendarHeatmap
            startDate={new Date('2024-01-01')}
            endDate={new Date('2024-12-31')}
            values={userProfile.calendarData}
            classForValue={(value) => {
              if (!value) {
                return 'color-empty';
              }
              return `color-scale-${value.count}`;
            }}
          />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5em', marginBottom: '20px' }}>得意・不得意分野</h2>
          <Radar data={userProfile.radarChartData} />
        </div>
      </div>
    </div>
  );
}
