'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar } from 'lucide-react';

export default function AlgorithmRadar() {
  const algorithmData = [
    { name: 'DP', score: 85, color: 'text-emerald-600' },
    { name: '全探索', score: 78, color: 'text-blue-600' },
    { name: '二分探索', score: 72, color: 'text-purple-600' },
    { name: 'グラフ', score: 45, color: 'text-red-600' },
    { name: 'ビット演算', score: 38, color: 'text-red-600' },
    { name: '数学', score: 65, color: 'text-amber-600' },
    { name: '文字列', score: 70, color: 'text-green-600' },
    { name: 'データ構造', score: 60, color: 'text-amber-600' },
  ];

  // Create SVG radar chart
  const centerX = 120;
  const centerY = 120;
  const maxRadius = 100;
  const angleStep = (2 * Math.PI) / algorithmData.length;

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

  // Create path for the data polygon
  const dataPath = algorithmData
    .map((item, index) => {
      const point = getPointPosition(index, item.score);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ') + ' Z';

  // Create grid circles
  const gridCircles = [20, 40, 60, 80, 100].map((percentage) => (
    <circle
      key={percentage}
      cx={centerX}
      cy={centerY}
      r={(percentage / 100) * maxRadius}
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="1"
    />
  ));

  // Create grid lines
  const gridLines = algorithmData.map((_, index) => {
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
  });

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Radar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-slate-900">
            アルゴリズム習熟度
          </CardTitle>
        </div>
        <p className="text-sm text-slate-600">
          分野別の得意・不得意を可視化
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Radar Chart */}
          <div className="flex justify-center">
            <svg width="240" height="240" className="overflow-visible">
              {/* Grid */}
              {gridCircles}
              {gridLines}
              
              {/* Data area */}
              <path
                d={dataPath}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              
              {/* Data points */}
              {algorithmData.map((item, index) => {
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
              {algorithmData.map((item, index) => {
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
          
          {/* Algorithm List */}
          <div className="space-y-2">
            {algorithmData
              .sort((a, b) => b.score - a.score)
              .map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${item.color}`}>
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}