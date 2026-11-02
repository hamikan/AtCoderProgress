'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { differenceInYears, format, subYears } from 'date-fns';
import type { RatingData } from '@/features/ratings/types';
import { getDifficultyColor } from '@/lib/atcoder/difficulty';

// 数値は「直近◯年」を表す
type RatingRange = number | 'ALL';

const RATING_BAND_SIZE = 400;
const RATING_BAND_MARGIN = 100;
const SHORT_SPAN_MS = 180 * 24 * 60 * 60 * 1000;

interface RatingGraphProps {
  data: RatingData[];
}

// 参加年数を切り捨てた数まで 1Y, 2Y, … を出す（1年未満なら ALL のみ）
function getYearRanges(data: RatingData[], now: Date): number[] {
  if (data.length === 0) return [];
  const years = differenceInYears(now, data[0].endedAt);
  return Array.from({ length: years }, (_, index) => index + 1);
}

// 縦軸の端を色の帯の境目にそろえ、線が端に張り付く場合は帯を1つ足す
function getRatingDomain(ratings: number[]): [number, number] {
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  let lower = Math.floor(min / RATING_BAND_SIZE) * RATING_BAND_SIZE;
  let upper = Math.ceil(max / RATING_BAND_SIZE) * RATING_BAND_SIZE;
  if (lower > 0 && min - lower < RATING_BAND_MARGIN) lower -= RATING_BAND_SIZE;
  if (upper - max < RATING_BAND_MARGIN) upper += RATING_BAND_SIZE;
  return [lower, upper];
}

export default function RatingGraph({ data }: RatingGraphProps) {
  const [range, setRange] = useState<RatingRange>('ALL');

  const yearRanges = useMemo(() => getYearRanges(data, new Date()), [data]);
  const rangeOptions: RatingRange[] = [...yearRanges, 'ALL'];

  const filteredData = useMemo(() => {
    if (range === 'ALL') return data;

    const cutoff = subYears(new Date(), range).getTime();
    return data.filter((d) => d.endedAt > cutoff);
  }, [data, range]);

  if (data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center text-slate-500 border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardContent>データがありません</CardContent>
      </Card>
    );
  }

  const [domainMin, domainMax] =
    filteredData.length > 0
      ? getRatingDomain(filteredData.map((d) => d.rating))
      : [0, RATING_BAND_SIZE];
  const yTicks = Array.from(
    { length: (domainMax - domainMin) / RATING_BAND_SIZE + 1 },
    (_, index) => domainMin + index * RATING_BAND_SIZE
  );
  const span =
    filteredData.length > 0
      ? filteredData[filteredData.length - 1].endedAt - filteredData[0].endedAt
      : 0;
  const tickFormat = span < SHORT_SPAN_MS ? 'M/d' : 'yyyy/M';

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;
  const latestChange = previous ? latest.rating - previous.rating : null;


  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">レート推移</CardTitle>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {rangeOptions.map((option) => (
              <button
                key={String(option)}
                onClick={() => setRange(option)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${range === option
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {option === 'ALL' ? 'ALL' : `${option}Y`}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart Container */}
        <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-white relative">
          {filteredData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              この期間の参加はありません
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#13ecec" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#13ecec" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Rating Bands Background */}
              {Array.from({ length: 8 }).map((_, i) => {
                const min = i * RATING_BAND_SIZE;
                const max = i === 7 ? 10000 : (i + 1) * RATING_BAND_SIZE;
                const bandColorClass = getDifficultyColor(min);

                if (max <= domainMin || min >= domainMax) return null;

                return (
                  <ReferenceArea
                    key={i}
                    y1={Math.max(min, domainMin)}
                    y2={Math.min(max, domainMax)}
                    className={bandColorClass}
                    fill="currentColor"
                    fillOpacity={0.1}
                    ifOverflow="extendDomain"
                  />
                );
              })}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />

              <XAxis
                dataKey="endedAt"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                tickFormatter={(value: number) => format(value, tickFormat)}
                minTickGap={30}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[domainMin, domainMax]}
                ticks={yTicks}
                width={40}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  padding: '12px',
                }}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value: unknown) => [
                  <span key="val" className="font-bold text-slate-900">{String(value)}</span>,
                  <span key="label" className="text-xs text-slate-500">Rating</span>
                ]}
                labelFormatter={(_, payload) => {
                  const point = payload[0]?.payload as RatingData | undefined;
                  if (!point) return null;

                  return (
                    <span className="mb-2 block">
                      <span className="text-xs text-slate-400 font-medium">
                        {format(point.endedAt, 'yyyy/MM/dd')}
                      </span>
                      <span className="text-sm font-bold text-slate-700 mt-1 block">
                        {point.contestName}
                      </span>
                    </span>
                  );
                }}
              />

              <Area
                type="monotone"
                dataKey="rating"
                stroke="#13ecec"
                strokeWidth={3}
                fill="url(#chart-fill)"
                activeDot={{ r: 6, fill: '#13ecec', stroke: 'white', strokeWidth: 2 }}
                dot={{ r: 4, fill: '#13ecec', stroke: 'white', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Latest contest result */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-sm">
          <span className="font-semibold text-slate-900">直近コンテスト</span>
          <span className="text-slate-700">{latest.contestName}</span>
          <span className="text-slate-500">Perf</span>
          <span className="font-semibold text-slate-900">
            {latest.performance.toLocaleString()}
          </span>
          {latestChange !== null && (
            <span
              className={`font-semibold ${latestChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {latestChange >= 0 ? `+${latestChange}` : latestChange}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
