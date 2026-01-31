import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Target, Calendar, Award, Zap } from 'lucide-react';

type StatKind =
  | 'acCount'
  | 'rating'
  | 'monthlySolved'
  | 'streak'
  | 'strength'
  | 'weakness';

type ChangeType = 'increase' | 'decrease' | 'neutral';
type StatValue = string | number;

interface StatInput {
  value: StatValue;
  change?: StatValue;
  changeType?: ChangeType;
}

interface StatsOverviewProps {
  stats?: Partial<Record<StatKind, StatInput>>;
}

const STAT_META: Record<
  StatKind,
  { title: string; icon: typeof Trophy; color: string; bgColor: string }
> = {
  acCount: {
    title: 'AC数',
    icon: Trophy,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  rating: {
    title: '現在レート',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  monthlySolved: {
    title: '今月の精進',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  streak: {
    title: '連続精進日数',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  strength: {
    title: '得意分野',
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  weakness: {
    title: '改善ポイント',
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

const DEFAULT_STATS: Record<StatKind, StatInput> = {
  acCount: { value: 1247, change: '+23', changeType: 'increase' },
  rating: { value: 1247, change: '+45', changeType: 'increase' },
  monthlySolved: { value: 89, change: '+12', changeType: 'increase' },
  streak: { value: 15, change: '継続中', changeType: 'neutral' },
  strength: { value: 'DP', change: '87% AC', changeType: 'neutral' },
  weakness: { value: 'グラフ', change: '要強化', changeType: 'decrease' },
};

const formatValue = (value: StatValue | undefined) => {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number') return value.toLocaleString();
  return value;
};

const formatChange = (change: StatValue | undefined) => {
  if (change === undefined || change === null) return '';
  if (typeof change === 'number') {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toLocaleString()}`;
  }
  return change;
};

const resolveChangeType = (changeType: ChangeType | undefined, change: StatValue | undefined) => {
  if (changeType) return changeType;
  if (typeof change === 'number') {
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  }
  return undefined;
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const order: StatKind[] = [
    'acCount',
    'rating',
    'monthlySolved',
    'streak',
    'strength',
    'weakness',
  ];

  const merged = order.map((kind) => ({
    kind,
    ...STAT_META[kind],
    ...DEFAULT_STATS[kind],
    ...(stats?.[kind] ?? {}),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {merged.map((stat) => {
        const changeText = formatChange(stat.change);
        const changeType = resolveChangeType(stat.changeType, stat.change);
        const showBadge = Boolean(changeText);
        return (
          <Card key={stat.kind} className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatValue(stat.value)}</div>
              <div className="flex items-center space-x-1 text-xs">
                {showBadge && (
                  <Badge
                    variant={
                      changeType === 'increase'
                        ? 'default'
                        : changeType === 'decrease'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {changeText}
                  </Badge>
                )}
                {changeType === 'increase' && (
                  <span className="text-slate-500">前月比</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
