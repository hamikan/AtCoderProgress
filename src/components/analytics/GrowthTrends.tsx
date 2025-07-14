'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Award, Target } from 'lucide-react';

interface GrowthTrendsProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export default function GrowthTrends({ selectedPeriod, setSelectedPeriod }: GrowthTrendsProps) {
  const periods = [
    { value: '1month', label: '1ヶ月' },
    { value: '3months', label: '3ヶ月' },
    { value: '6months', label: '6ヶ月' },
    { value: '1year', label: '1年' },
    { value: 'all', label: '全期間' },
  ];

  // Sample data for charts
  const ratingData = [
    { month: '2024-01', rating: 1050 },
    { month: '2024-02', rating: 1120 },
    { month: '2024-03', rating: 1180 },
    { month: '2024-04', rating: 1150 },
    { month: '2024-05', rating: 1220 },
    { month: '2024-06', rating: 1247 },
  ];

  const acData = [
    { month: '2024-01', ac: 45 },
    { month: '2024-02', ac: 52 },
    { month: '2024-03', ac: 38 },
    { month: '2024-04', ac: 61 },
    { month: '2024-05', ac: 47 },
    { month: '2024-06', ac: 55 },
  ];

  const difficultyData = [
    { difficulty: '~399', count: 120, percentage: 35 },
    { difficulty: '400-799', count: 89, percentage: 26 },
    { difficulty: '800-1199', count: 67, percentage: 20 },
    { difficulty: '1200-1599', count: 45, percentage: 13 },
    { difficulty: '1600+', count: 21, percentage: 6 },
  ];

  const milestones = [
    {
      date: '2024-06-15',
      title: 'レート1200突破',
      description: 'ABC 350で自己ベスト更新',
      type: 'rating',
    },
    {
      date: '2024-05-20',
      title: '生涯AC数1000問達成',
      description: '継続的な精進の成果',
      type: 'achievement',
    },
    {
      date: '2024-04-10',
      title: '連続精進30日達成',
      description: '学習習慣の定着',
      type: 'streak',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Period Selection */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              成長トレンド分析
            </CardTitle>
            <div className="flex space-x-2">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.value)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Trend */}
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>レート推移</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple line chart representation */}
              <div className="h-48 bg-gradient-to-t from-blue-50 to-transparent rounded-lg p-4 relative">
                <div className="absolute inset-4">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <polyline
                      points="0,100 50,80 100,60 150,70 200,40 250,30"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      className="drop-shadow-sm"
                    />
                    {ratingData.map((point, index) => (
                      <circle
                        key={index}
                        cx={index * 50}
                        cy={100 - (point.rating - 1000) / 5}
                        r="4"
                        fill="#3b82f6"
                        className="drop-shadow-sm"
                      />
                    ))}
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-slate-900">1247</div>
                  <div className="text-xs text-slate-600">現在レート</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-600">+197</div>
                  <div className="text-xs text-slate-600">6ヶ月の成長</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">1350</div>
                  <div className="text-xs text-slate-600">最高レート</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AC Count Trend */}
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <span>AC数推移</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bar chart representation */}
              <div className="h-48 bg-gradient-to-t from-emerald-50 to-transparent rounded-lg p-4 flex items-end justify-between">
                {acData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div
                      className="bg-emerald-500 rounded-t-sm w-8 transition-all hover:bg-emerald-600"
                      style={{ height: `${(data.ac / 70) * 100}%` }}
                    />
                    <div className="text-xs text-slate-600 transform -rotate-45">
                      {data.month.slice(-2)}月
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-slate-900">1,456</div>
                  <div className="text-xs text-slate-600">総AC数</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-600">52</div>
                  <div className="text-xs text-slate-600">月平均AC</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-amber-600">61</div>
                  <div className="text-xs text-slate-600">最高月間AC</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>難易度別AC分布</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {difficultyData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{item.count}問</span>
                    <Badge variant="outline" className="text-xs">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            <span>成長マイルストーン</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex-shrink-0">
                  {milestone.type === 'rating' && (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  {milestone.type === 'achievement' && (
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                  {milestone.type === 'streak' && (
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                  <p className="text-sm text-slate-600">{milestone.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}