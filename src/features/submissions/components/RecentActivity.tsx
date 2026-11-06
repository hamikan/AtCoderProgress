import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecentSubmission } from '@/features/submissions/types';
import { getDifficultyColor } from '@/lib/atcoder/difficulty';
import { formatProblemDisplayName } from '@/lib/atcoder/problem-name';

interface RecentActivityProps {
  activities?: RecentSubmission[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const displayActivities = activities ?? [];

  const getStatusColor = (result: string) => {
    if (result === 'AC') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          最近の記録
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            精進履歴がありません
          </div>
        ) : (
          <div>
            {displayActivities.map((activity) => (
              <a
                key={activity.id}
                href={`https://atcoder.jp/contests/${activity.contestId}/submissions/${activity.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border-b border-slate-100 px-2 py-2.5 transition-colors last:border-b-0 hover:bg-slate-50"
              >
                <Badge className={`text-xs ${getStatusColor(activity.result)}`}>
                  {activity.result}
                </Badge>
                {activity.difficulty !== null && (
                  <span
                    className={`min-w-10 text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}
                  >
                    {activity.difficulty}
                  </span>
                )}
                <span className="flex-1 truncate font-semibold text-slate-900">
                  {formatProblemDisplayName(
                    activity.contestId,
                    activity.problemId,
                    activity.title
                  )}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(activity.epochSecond * 1000), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
