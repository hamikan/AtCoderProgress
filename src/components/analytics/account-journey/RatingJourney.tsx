'use client';

import { Activity, CalendarDays, CheckCircle2, Clock3, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type {
  CurriculumSectionProgress,
  RatingBandSummary,
} from '@/lib/services/db/stats';
import CurriculumBandProgressTable from './CurriculumBandProgressTable';
import { formatDifficulty } from './format';
import Metric from './Metric';

interface RatingJourneyProps {
  bands: RatingBandSummary[];
  curriculumSections: CurriculumSectionProgress[];
}

export default function RatingJourney({
  bands,
  curriculumSections,
}: RatingJourneyProps) {
  const [selectedBandKey, setSelectedBandKey] = useState(bands[0]?.band.key ?? null);
  const selectedBand = useMemo(
    () => bands.find((summary) => summary.band.key === selectedBandKey) ?? bands[0],
    [bands, selectedBandKey]
  );

  if (bands.length === 0) {
    return (
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardContent className="py-10 text-center text-sm text-slate-500">
          提出履歴やRated参加履歴が増えると、色ごとの遍歴がここに並びます。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-slate-700" />
            色ごとの遍歴
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {bands.map((summary) => {
              const isSelected = summary.band.key === selectedBand.band.key;

              return (
                <Button
                  key={summary.band.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedBandKey(summary.band.key)}
                  className={cn(
                    'h-8 border px-3 text-xs shadow-none',
                    isSelected
                      ? `${summary.band.borderColor} ${summary.band.bgColor} ${summary.band.textColor}`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', summary.band.barColor)} />
                  {summary.band.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BandDetail summary={selectedBand} curriculumSections={curriculumSections} />
      </CardContent>
    </Card>
  );
}

function BandDetail({
  summary,
  curriculumSections,
}: {
  summary: RatingBandSummary;
  curriculumSections: CurriculumSectionProgress[];
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        summary.band.borderColor,
        summary.band.bgColor
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('text-xl font-bold', summary.band.textColor)}>
              {summary.band.label}
            </span>
            <Badge
              variant="outline"
              className={cn(summary.band.borderColor, summary.band.textColor)}
            >
              {summary.band.rangeLabel}
            </Badge>
            <span className="text-xs text-slate-500">
              {formatActivityRange(summary)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="滞在期間" value={summary.periodLabel} />
        <Metric label="活動日" value={`${summary.activeDays}日`} />
        <Metric label="提出" value={`${summary.submissionCount.toLocaleString()}回`} />
        <Metric label="AC提出" value={`${summary.acSubmissionCount.toLocaleString()}回`} />
      </div>

      <MetricSection
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        title="解いた量"
        metrics={[
          ['挑戦問題', `${summary.attemptedCount.toLocaleString()}問`],
          ['初AC', `${summary.acceptedCount.toLocaleString()}問`],
          ['初AC/挑戦', formatPercent(summary.solveRate)],
          ['AC提出率', formatPercent(summary.acceptanceRate)],
        ]}
      />

      <MetricSection
        icon={<Activity className="h-4 w-4 text-blue-600" />}
        title="Difficulty"
        metrics={[
          ['平均AC Diff', formatDifficulty(summary.averageDifficulty)],
          ['中央値AC Diff', formatDifficulty(summary.medianDifficulty)],
          ['最高AC Diff', formatDifficulty(summary.maxDifficulty)],
          ['最低AC Diff', formatDifficulty(summary.minDifficulty)],
          ['平均挑戦 Diff', formatDifficulty(summary.averageAttemptedDifficulty)],
        ]}
      />

      <MetricSection
        icon={<CalendarDays className="h-4 w-4 text-slate-600" />}
        title="Rated"
        metrics={[
          ['Rated参加', `${summary.contestCount.toLocaleString()}回`],
          ['最高Perf', summary.bestPerformance?.toLocaleString() ?? '-'],
          ['色の範囲', summary.band.rangeLabel],
          ['1日あたり初AC', formatDailyRate(summary.acceptedCount, summary.totalDays)],
        ]}
      />

      <DifficultyDistribution summary={summary} />

      <CurriculumBandProgressTable
        sections={curriculumSections}
        selectedBand={summary.band}
      />
    </div>
  );
}

function MetricSection({
  icon,
  title,
  metrics,
}: {
  icon: ReactNode;
  title: string;
  metrics: [string, string][];
}) {
  return (
    <section className="mt-4 rounded-lg border border-white/80 bg-white/70 p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
        {icon}
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Metric key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function DifficultyDistribution({ summary }: { summary: RatingBandSummary }) {
  if (summary.difficultyDistribution.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-white/80 bg-white/70 px-3 py-3 text-sm text-slate-500">
        この色の時期に初ACした問題はまだありません。
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-white/80 bg-white/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Clock3 className="h-4 w-4 text-slate-600" />
          ACしたDifficulty帯
        </span>
        <span className="text-xs text-slate-500">初AC基準</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {summary.difficultyDistribution.map((bucket) => (
          <div
            key={bucket.key}
            className={bucket.barColor}
            style={{ width: `${bucket.percentage}%` }}
            title={`${bucket.label}: ${bucket.count}問`}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {summary.difficultyDistribution.map((bucket) => (
          <div key={bucket.key} className={cn('rounded-md px-3 py-2', bucket.bgColor)}>
            <div className="flex items-center justify-between gap-2">
              <span className={cn('text-sm font-semibold', bucket.textColor)}>
                {bucket.label}diff
              </span>
              <span className="text-sm font-semibold text-slate-950">
                {bucket.count.toLocaleString()}問
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>{bucket.rangeLabel}</span>
              <span>{bucket.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatActivityRange(summary: RatingBandSummary) {
  if (!summary.firstActivityDate) return '活動ログなし';
  if (!summary.lastActivityDate || summary.lastActivityDate === summary.firstActivityDate) {
    return summary.firstActivityDate;
  }

  return `${summary.firstActivityDate} - ${summary.lastActivityDate}`;
}

function formatPercent(value: number) {
  return `${value}%`;
}

function formatDailyRate(count: number, totalDays: number) {
  if (totalDays === 0) return '-';

  return `${(count / totalDays).toFixed(2)}問`;
}
