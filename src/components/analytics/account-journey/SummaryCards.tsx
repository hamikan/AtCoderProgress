import { Activity, Award, Gauge, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountJourneyAnalytics } from '@/lib/services/db/stats';

interface SummaryCardsProps {
  data: AccountJourneyAnalytics;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const items = [
    {
      label: '初AC済み',
      value: data.summary.acCount.toLocaleString(),
      detail: `${data.summary.attemptedCount.toLocaleString()}問に挑戦`,
      icon: Trophy,
      iconClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
    },
    {
      label: '活動日数',
      value: data.summary.activeDays.toLocaleString(),
      detail: '提出があった日',
      icon: Activity,
      iconClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
    {
      label: 'Rated参加',
      value: data.summary.ratedContestCount.toLocaleString(),
      detail: `${data.summary.activeBandCount}色で活動`,
      icon: Award,
      iconClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    {
      label: '現在レート',
      value: data.ratingFitness.currentRating.toLocaleString(),
      detail: `最高 ${data.ratingFitness.highestRating.toLocaleString()}`,
      icon: Gauge,
      iconClass: data.ratingFitness.currentBand.textColor,
      bgClass: data.ratingFitness.currentBand.bgColor,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {item.label}
            </CardTitle>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bgClass}`}>
              <item.icon className={`h-4 w-4 ${item.iconClass}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{item.value}</div>
            <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
