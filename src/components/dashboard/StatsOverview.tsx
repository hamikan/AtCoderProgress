'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Target, Calendar, Award, Zap } from 'lucide-react';

export default function StatsOverview() {
  const stats = [
    {
      title: '生涯AC数',
      value: '1,247',
      change: '+23',
      changeType: 'increase',
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: '現在レート',
      value: '1,247',
      change: '+45',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: '今月の精進',
      value: '89',
      change: '+12',
      changeType: 'increase',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '連続精進日数',
      value: '15',
      change: '継続中',
      changeType: 'neutral',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '得意分野',
      value: 'DP',
      change: '87% AC',
      changeType: 'neutral',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '改善ポイント',
      value: 'グラフ',
      change: '要強化',
      changeType: 'decrease',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="flex items-center space-x-1 text-xs">
              <Badge
                variant={
                  stat.changeType === 'increase'
                    ? 'default'
                    : stat.changeType === 'decrease'
                    ? 'destructive'
                    : 'secondary'
                }
                className="text-xs"
              >
                {stat.change}
              </Badge>
              {stat.changeType === 'increase' && (
                <span className="text-slate-500">前月比</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}