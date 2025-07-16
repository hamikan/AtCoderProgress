'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Trophy, Target } from 'lucide-react';

export default function ActivityPatterns() {
  // Sample data for activity patterns
  const hourlyActivity = [
    { hour: '00', problems: 2 },
    { hour: '01', problems: 1 },
    { hour: '02', problems: 0 },
    { hour: '03', problems: 0 },
    { hour: '04', problems: 0 },
    { hour: '05', problems: 1 },
    { hour: '06', problems: 3 },
    { hour: '07', problems: 8 },
    { hour: '08', problems: 12 },
    { hour: '09', problems: 15 },
    { hour: '10', problems: 18 },
    { hour: '11', problems: 22 },
    { hour: '12', problems: 16 },
    { hour: '13', problems: 14 },
    { hour: '14', problems: 20 },
    { hour: '15', problems: 25 },
    { hour: '16', problems: 28 },
    { hour: '17', problems: 24 },
    { hour: '18', problems: 19 },
    { hour: '19', problems: 21 },
    { hour: '20', problems: 26 },
    { hour: '21', problems: 23 },
    { hour: '22', problems: 18 },
    { hour: '23', problems: 12 },
  ];

  const weeklyActivity = [
    { day: '月', problems: 45, percentage: 85 },
    { day: '火', problems: 52, percentage: 98 },
    { day: '水', problems: 38, percentage: 72 },
    { day: '木', problems: 61, percentage: 100 },
    { day: '金', problems: 47, percentage: 89 },
    { day: '土', problems: 34, percentage: 64 },
    { day: '日', problems: 29, percentage: 55 },
  ];

  const contestHistory = [
    {
      date: '2024-06-15',
      contest: 'ABC 350',
      rank: 1247,
      performance: 1285,
      solved: 4,
      total: 6,
      ratingChange: +23,
    },
    {
      date: '2024-06-08',
      contest: 'ABC 349',
      rank: 1456,
      performance: 1198,
      solved: 3,
      total: 6,
      ratingChange: -12,
    },
    {
      date: '2024-06-01',
      contest: 'ARC 175',
      rank: 892,
      performance: 1324,
      solved: 2,
      total: 4,
      ratingChange: +35,
    },
    {
      date: '2024-05-25',
      contest: 'ABC 348',
      rank: 1123,
      performance: 1267,
      solved: 4,
      total: 6,
      ratingChange: +18,
    },
  ];

  const maxHourlyProblems = Math.max(...hourlyActivity.map(h => h.problems));
  const peakHours = hourlyActivity
    .filter(h => h.problems >= maxHourlyProblems * 0.8)
    .map(h => h.hour);

  const bestDay = weeklyActivity.reduce((best, current) => 
    current.problems > best.problems ? current : best
  );

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">最も活発な時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {peakHours[0]}:00-{peakHours[peakHours.length - 1]}:00
            </div>
            <p className="text-xs text-slate-600">ピークタイム</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">最も活発な曜日</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{bestDay.day}曜日</div>
            <p className="text-xs text-slate-600">{bestDay.problems}問解答</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">コンテスト参加率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <p className="text-xs text-slate-600">過去3ヶ月</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">平均解答時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">23分</div>
            <p className="text-xs text-slate-600">1問あたり</p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Pattern */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>時間帯別活動パターン</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 bg-gradient-to-t from-blue-50 to-transparent rounded-lg p-4 flex items-end justify-between">
              {hourlyActivity.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div
                    className="bg-blue-500 rounded-t-sm w-3 transition-all hover:bg-blue-600"
                    style={{ height: `${(data.problems / maxHourlyProblems) * 100}%` }}
                    title={`${data.hour}:00 - ${data.problems}問`}
                  />
                  {index % 4 === 0 && (
                    <div className="text-xs text-slate-600">{data.hour}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-slate-600">
              最も活発な時間帯: {peakHours.join(', ')}時台
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Pattern */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span>曜日別活動パターン</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{day.day}曜日</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{day.problems}問</span>
                    <Badge variant="outline" className="text-xs">
                      {day.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${day.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contest Performance */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span>コンテスト参加履歴</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contestHistory.map((contest, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{contest.contest}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={contest.ratingChange >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                    </Badge>
                    <span className="text-xs text-slate-500">{contest.date}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">順位: </span>
                    <span className="font-medium text-slate-900">{contest.rank}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">パフォーマンス: </span>
                    <span className="font-medium text-slate-900">{contest.performance}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">解答: </span>
                    <span className="font-medium text-slate-900">{contest.solved}/{contest.total}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">正答率: </span>
                    <span className="font-medium text-slate-900">
                      {Math.round((contest.solved / contest.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}