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
import { format, subYears, isAfter, parseISO } from 'date-fns';
import { getDifficultyColor } from '@/lib/utils';

interface RatingGraphProps {
  data: {
    date: string;
    rating: number;
    contestName: string;
  }[];
}


export default function RatingGraph({ data }: RatingGraphProps) {
  const [range, setRange] = useState<'1Y' | 'ALL'>('ALL');

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (range === 'ALL') return data;

    const oneYearAgo = subYears(new Date(), 1);
    return data.filter((d) => isAfter(parseISO(d.date), oneYearAgo));
  }, [data, range]);

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center text-slate-500 border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardContent>データがありません</CardContent>
      </Card>
    );
  }

  const minRating = Math.min(...filteredData.map((d) => d.rating));
  const maxRating = Math.max(...filteredData.map((d) => d.rating));

  // Dynamic Y-axis domain padding with 400 steps
  const yMin = Math.max(0, Math.floor(minRating / 400) * 400);
  const yMax = Math.ceil(maxRating / 400) * 400;
  // Ensure at least one band is shown above the max rating for visual breathing room if it's close to the top
  const domainMax = yMax < maxRating + 100 ? yMax + 400 : yMax;


  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Rating History</CardTitle>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setRange('1Y')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${range === '1Y'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              1Y
            </button>
            <button
              onClick={() => setRange('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${range === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              ALL
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart Container */}
        <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-white relative">
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
                const min = i * 400;
                const max = i === 7 ? 10000 : (i + 1) * 400;
                const bandColorClass = getDifficultyColor(min);

                if (min >= domainMax) return null;

                return (
                  <ReferenceArea
                    key={i}
                    y1={min}
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
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                tickFormatter={(val) => {
                  const d = parseISO(val);
                  return format(d, 'MMM');
                }}
                minTickGap={30}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, domainMax]}
                ticks={Array.from({ length: domainMax / 400 + 1 }, (_, i) => i * 400)}
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
                formatter={(value: any) => [
                  <span key="val" className="font-bold text-slate-900">{value}</span>,
                  <span key="label" className="text-xs text-slate-500">Rating</span>
                ]}
                labelFormatter={(label) => (
                  <span className="mb-2 block">
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                    {/* We could try to find contest name here if needed */}
                    {typeof label === 'string' && filteredData.find(d => d.date === label) && (
                      <span className="text-sm font-bold text-slate-700 mt-1 block">
                        {filteredData.find(d => d.date === label)?.contestName}
                      </span>
                    )}
                  </span>
                )}
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
        </div>
      </CardContent>
    </Card>
  );
}
