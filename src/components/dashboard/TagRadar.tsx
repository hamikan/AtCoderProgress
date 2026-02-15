'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Duplicate interface to avoid server import issues in client component
export interface TagStat {
  name: string;
  score: number; // 0-100
  total: number;
  solved: number;
}

interface TagRadarProps {
  initialStats?: TagStat[];
}

const COLORS = [
  'text-emerald-600',
  'text-blue-600',
  'text-purple-600',
  'text-red-600',
  'text-amber-600',
  'text-green-600',
  'text-indigo-600',
  'text-pink-600',
];

export default function TagRadar({ initialStats = [] }: TagRadarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  // Default to top 8 tags if available
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialStats.slice(0, 8).map((s) => s.name)
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedTags');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedTags(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved tags', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('selectedTags', JSON.stringify(selectedTags));
    }
  }, [selectedTags, isLoaded]);

  const statsMap = new Map(initialStats.map((s) => [s.name, s]));

  // Filter stats based on selection and sort by original score (or keep user order? let's sort by score)
  const displayStats = selectedTags
    .map((tag) => statsMap.get(tag))
    .filter((s): s is TagStat => !!s)
    .sort((a, b) => b.score - a.score);

  // If no stats, use placeholder or empty
  const hasData = displayStats.length > 0;

  // Create SVG radar chart
  const centerX = 120;
  const centerY = 120;
  const maxRadius = 100;
  // If no data, render a default polygon or nothing.
  // We need at least 3 points for a polygon usually.
  const angleStep = hasData ? (2 * Math.PI) / displayStats.length : 0;

  const getPointPosition = (index: number, score: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = (score / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getLabelPosition = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = maxRadius + 20;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const dataPath = hasData
    ? displayStats
      .map((item, index) => {
        const point = getPointPosition(index, item.score);
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ') + ' Z'
    : '';

  const gridLevels = [20, 40, 60, 80, 100];

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((t) => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Radar className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              タグ別習熟度
            </CardTitle>
          </div>
          <p className="text-sm text-slate-600">
            分野別の得意・不得意を可視化
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <div className="p-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">表示タグ設定</span>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {initialStats.length === 0 ? (
                  <div className="p-2 text-xs text-slate-500 text-center">
                    タグデータがありません
                  </div>
                ) : (
                  initialStats.map((stat) => (
                    <div key={stat.name} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md">
                      <Checkbox
                        id={`tag-${stat.name}`}
                        checked={selectedTags.includes(stat.name)}
                        onCheckedChange={() => handleToggleTag(stat.name)}
                      />
                      <Label htmlFor={`tag-${stat.name}`} className="text-sm cursor-pointer flex-1">
                        {stat.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px] text-slate-400 text-sm">
            表示するデータがありません
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Radar Chart */}
            <div className="flex justify-center">
              <svg width="240" height="240" className="overflow-visible">
                {/* Grid Circles */}
                {gridLevels.map((percentage) => (
                  <circle
                    key={percentage}
                    cx={centerX}
                    cy={centerY}
                    r={(percentage / 100) * maxRadius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                {/* Grid Lines (Spokes) */}
                {displayStats.map((_, index) => {
                  const endPoint = getPointPosition(index, 100);
                  return (
                    <line
                      key={index}
                      x1={centerX}
                      y1={centerY}
                      x2={endPoint.x}
                      y2={endPoint.y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Data Polygon */}
                <path
                  d={dataPath}
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {/* Data Points */}
                {displayStats.map((item, index) => {
                  const point = getPointPosition(index, item.score);
                  return (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Labels */}
                {displayStats.map((item, index) => {
                  const labelPos = getLabelPosition(index);
                  return (
                    <text
                      key={index}
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-medium fill-slate-700"
                    >
                      {item.name}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Stats List */}
            <div className="space-y-3">
              {displayStats.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 min-w-[60px] justify-end">
                      <span className={`text-sm font-bold ${COLORS[index % COLORS.length]}`}>
                        {item.score}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.solved}/{item.total})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}