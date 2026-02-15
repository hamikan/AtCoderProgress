'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { getDifficultyColor } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecentActivityItem {
  id: number;
  epochSecond: number;
  problemId: string;
  contestId: string;
  title: string;
  result: string;
  language: string;
  point: number;
  difficulty: number | null;
}

interface RecentActivityProps {
  activities?: RecentActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  // Fallback if no activities provided (though we should provide them)
  const displayActivities = activities && activities.length > 0 ? activities : [];

  const getStatusIcon = (result: string) => {
    if (result === 'AC') {
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    }
    return <XCircle className="h-4 w-4 text-amber-600" />;
  };

  const getStatusColor = (result: string) => {
    if (result === 'AC') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-700 border-amber-200';
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
        {displayActivities.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            精進履歴がありません
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="group rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(activity.result)}
                      <Badge className={`text-xs ${getStatusColor(activity.result)}`}>
                        {activity.result}
                      </Badge>
                      {activity.difficulty !== null && (
                        <span className={`text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
                          {activity.difficulty}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.epochSecond * 1000), { addSuffix: true, locale: ja })}
                      </span>
                    </div>

                    {/* Problem Info */}
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-slate-600">{activity.contestId.toUpperCase()}</p>
                    </div>

                    {/* Tags (Mock or Empty for now as we don't have tags in simple fetch) */}
                    {/* <div className="flex flex-wrap gap-1">...</div> */}

                    {/* Actions (Mock for now) */}
                    <div className="flex items-center space-x-2 text-xs">
                      {/* Placeholder for code/memo status */}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                      <a href={`https://atcoder.jp/contests/${activity.contestId}/submissions/${activity.id}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}