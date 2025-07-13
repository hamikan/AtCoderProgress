'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Target, TrendingUp, BookOpen } from 'lucide-react';

export default function ProblemStats() {
  const stats = [
    {
      title: '総問題数',
      value: '3,247',
      change: '+23',
      changeType: 'increase',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'AC済み',
      value: '1,456',
      change: '44.8%',
      changeType: 'neutral',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: '挑戦中',
      value: '127',
      change: '+12',
      changeType: 'increase',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: '未挑戦',
      value: '1,664',
      change: '51.2%',
      changeType: 'neutral',
      icon: Target,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
    {
      title: '今月のAC',
      value: '89',
      change: '+15',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'コンテスト数',
      value: '415',
      change: '+5',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
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