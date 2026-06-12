import { Gauge, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountJourneyAnalytics } from '@/lib/services/db/stats';
import Metric from './Metric';

interface RatingFitnessPanelProps {
  data: AccountJourneyAnalytics;
}

export default function RatingFitnessPanel({ data }: RatingFitnessPanelProps) {
  const fitness = data.ratingFitness;

  return (
    <Card className="h-full border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gauge className="h-5 w-5 text-slate-700" />
          レート適性度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className={`rounded-lg border p-4 ${fitness.currentBand.bgColor} ${fitness.currentBand.borderColor}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600">現在の色</p>
              <p className={`mt-1 text-2xl font-bold ${fitness.currentBand.textColor}`}>
                {fitness.currentBand.label}
              </p>
            </div>
            <Badge variant="outline" className={`${fitness.currentBand.borderColor} ${fitness.currentBand.textColor}`}>
              {fitness.currentBand.rangeLabel}
            </Badge>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{fitness.label}</span>
            <span className="font-semibold text-slate-950">
              適性度 {formatFitnessScore(fitness.fitnessScore)}
            </span>
          </div>
          <FitnessScale
            score={fitness.fitnessScore}
            leftLabel="レート高め"
            rightLabel="伸びしろ"
          />
          <p className="mt-3 text-sm leading-6 text-slate-600">{fitness.description}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <TrendingUp className="h-4 w-4 text-slate-600" />
              成長圧
            </span>
            <span className="font-semibold text-slate-950">
              {fitness.growthLabel} {formatFitnessScore(fitness.growthScore)}
            </span>
          </div>
          <FitnessScale
            score={fitness.growthScore}
            leftLabel="下振れ"
            rightLabel="上昇圧"
          />
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {fitness.growthDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="加重平均Perf" value={fitness.weightedAveragePerformance?.toLocaleString() ?? '-'} />
          <Metric label="加重ばらつき" value={fitness.weightedPerformanceStdDev?.toLocaleString() ?? '-'} />
          <Metric label="加重Perf差" value={formatSigned(fitness.growthPressure)} />
          <Metric label="Perf差ばらつき" value={fitness.growthPressureStdDev?.toLocaleString() ?? '-'} />
          <Metric label="対象Rated" value={`${fitness.performanceContestCount.toLocaleString()}回`} />
          <Metric label="減衰スケール" value={`${fitness.performanceDecayDays.toLocaleString()}日`} />
        </div>

        {fitness.nextBand && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">次の色まで</p>
            <p className="mt-1 text-sm text-slate-700">
              {fitness.nextBand.label}まであと{' '}
              <span className="font-semibold text-slate-950">
                {(fitness.nextBand.min - fitness.currentRating).toLocaleString()}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FitnessScale({
  score,
  leftLabel,
  rightLabel,
}: {
  score: number | null;
  leftLabel: string;
  rightLabel: string;
}) {
  const markerPosition = score === null ? null : getFitnessMarkerPosition(score);

  return (
    <div>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-3 h-2 rounded-full bg-slate-100" />
        <div className="absolute left-1/2 top-1 h-6 w-px bg-slate-300" />
        {markerPosition !== null && (
          <div
            className="absolute top-1 h-6 w-2 rounded-full bg-slate-900"
            style={{ left: `${markerPosition}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>{leftLabel}</span>
        <span>50</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function formatFitnessScore(score: number | null) {
  return score === null ? '-' : score.toFixed(1);
}

function formatSigned(value: number | null) {
  if (value === null) return '-';

  return `${value > 0 ? '+' : ''}${value.toLocaleString()}`;
}

function getFitnessMarkerPosition(score: number) {
  const min = 20;
  const max = 80;
  const clamped = Math.min(Math.max(score, min), max);

  return ((clamped - min) / (max - min)) * 100;
}
