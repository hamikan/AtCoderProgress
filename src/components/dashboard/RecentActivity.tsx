'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';

export default function RecentActivity() {
  const recentActivities = [
    {
      id: 1,
      type: 'ac',
      problem: 'ABC 301 D - Bitmask',
      contest: 'AtCoder Beginner Contest 301',
      difficulty: 1200,
      status: '自力AC',
      time: '2時間前',
      tags: ['ビット演算', '全探索'],
      code: true,
      memo: true,
    },
    {
      id: 2,
      type: 'explanation',
      problem: 'ABC 300 E - Dice Product 3',
      contest: 'AtCoder Beginner Contest 300',
      difficulty: 1400,
      status: '解説AC',
      time: '5時間前',
      tags: ['確率', 'DP'],
      code: true,
      memo: true,
    },
    {
      id: 3,
      type: 'attempt',
      problem: 'ABC 299 F - Square Subsequence',
      contest: 'AtCoder Beginner Contest 299',
      difficulty: 1600,
      status: '挑戦中',
      time: '1日前',
      tags: ['文字列', 'DP'],
      code: false,
      memo: true,
    },
    {
      id: 4,
      type: 'ac',
      problem: 'ABC 298 C - Cards Query Problem',
      contest: 'AtCoder Beginner Contest 298',
      difficulty: 1100,
      status: '自力AC',
      time: '2日前',
      tags: ['データ構造', 'map'],
      code: true,
      memo: false,
    },
    {
      id: 5,
      type: 'contest_fail',
      problem: 'ABC 297 D - Count Subtractions',
      contest: 'AtCoder Beginner Contest 297',
      difficulty: 1300,
      status: '本番未AC',
      time: '3日前',
      tags: ['数学', 'ユークリッド互除法'],
      code: false,
      memo: true,
    },
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'ac':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'explanation':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'contest_fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'ac':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'explanation':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contest_fail':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 800) return 'text-gray-600';
    if (difficulty < 1200) return 'text-amber-600';
    if (difficulty < 1600) return 'text-emerald-600';
    if (difficulty < 2000) return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              最近の活動
            </CardTitle>
          </div>
          <Button variant="outline" size="sm">
            すべて見る
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          直近の精進記録と解法メモ
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="group rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  {/* Header */}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(activity.type)}
                    <Badge className={`text-xs ${getStatusColor(activity.type)}`}>
                      {activity.status}
                    </Badge>
                    <span className={`text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
                      {activity.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>

                  {/* Problem Info */}
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                      {activity.problem}
                    </h3>
                    <p className="text-sm text-slate-600">{activity.contest}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {activity.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 text-xs">
                    {activity.code && (
                      <span className="flex items-center text-emerald-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        コード記録済み
                      </span>
                    )}
                    {activity.memo && (
                      <span className="flex items-center text-blue-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        メモ記録済み
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-1">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}