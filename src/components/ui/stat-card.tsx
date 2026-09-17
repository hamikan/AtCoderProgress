import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ChangeType = 'increase' | 'decrease' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: ChangeType;
  icon: LucideIcon;
  iconClassName: string;
  iconBackgroundClassName: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
}: StatCardProps) {
  const formattedChange = formatChange(change);
  const resolvedChangeType = changeType ?? inferChangeType(change);

  return (
    <Card className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBackgroundClassName}`}>
          <Icon className={`h-4 w-4 ${iconClassName}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{formatValue(value)}</div>
        <div className="mt-1 flex h-5 items-center space-x-1 text-xs">
          {formattedChange && (
            <Badge
              variant={
                resolvedChangeType === 'increase'
                  ? 'default'
                  : resolvedChangeType === 'decrease'
                    ? 'destructive'
                    : 'secondary'
              }
              className="text-xs"
            >
              {formattedChange}
            </Badge>
          )}
          {(resolvedChangeType === 'increase' || resolvedChangeType === 'decrease') && (
            <span className="text-slate-500">前月比</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: string | number): string {
  return typeof value === 'number' ? value.toLocaleString() : value;
}

function formatChange(change: string | number | undefined): string {
  if (change === undefined) return '';
  if (typeof change === 'string') return change;
  return `${change > 0 ? '+' : ''}${change.toLocaleString()}`;
}

function inferChangeType(change: string | number | undefined): ChangeType {
  if (typeof change !== 'number' || change === 0) return 'neutral';
  return change > 0 ? 'increase' : 'decrease';
}
