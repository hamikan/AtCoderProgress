'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, BookOpen, Target } from 'lucide-react';

export default function WeaknessAnalysis() {
  const weaknesses = [
    {
      algorithm: 'グラフ',
      score: 45,
      trend: 'down',
      issues: ['DFS/BFSの実装ミス', '最短経路問題の理解不足'],
      recommendations: ['基本的なグラフ探索から復習', '典型問題を10問解く'],
      priority: 'high',
    },
    {
      algorithm: 'ビット演算',
      score: 38,
      trend: 'down',
      issues: ['ビット操作の基本理解不足', '状態圧縮DPが苦手'],
      recommendations: ['ビット演算の基礎を学習', '簡単な問題から段階的に'],
      priority: 'high',
    },
    {
      algorithm: 'データ構造',
      score: 60,
      trend: 'stable',
      issues: ['セグメント木の実装', 'Union-Findの応用'],
      recommendations: ['ライブラリを整備', '応用問題に挑戦'],
      priority: 'medium',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600';
    if (score < 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg font-semibold text-slate-900">
            弱点分析
          </CardTitle>
        </div>
        <p className="text-sm text-slate-600">
          改善が必要な分野と対策を提案
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {weaknesses.map((weakness, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900">
                  {weakness.algorithm}
                </h3>
                <Badge className={getPriorityColor(weakness.priority)}>
                  {weakness.priority === 'high' ? '要改善' : '改善推奨'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getScoreColor(weakness.score)}`}>
                  {weakness.score}%
                </span>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </div>

            {/* Issues */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                課題
              </h4>
              <ul className="space-y-1">
                {weakness.issues.map((issue, issueIndex) => (
                  <li key={issueIndex} className="text-xs text-slate-600 pl-4 relative">
                    <span className="absolute left-0 top-1.5 w-1 h-1 bg-slate-400 rounded-full" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 flex items-center">
                <BookOpen className="h-3 w-3 mr-1 text-blue-500" />
                推奨対策
              </h4>
              <ul className="space-y-1">
                {weakness.recommendations.map((rec, recIndex) => (
                  <li key={recIndex} className="text-xs text-slate-600 pl-4 relative">
                    <span className="absolute left-0 top-1.5 w-1 h-1 bg-blue-400 rounded-full" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              対策問題を見る
            </Button>
          </div>
        ))}

        {/* Overall Action */}
        <div className="pt-4 border-t border-slate-200">
          <Button className="w-full bg-amber-600 hover:bg-amber-700">
            <BookOpen className="h-4 w-4 mr-2" />
            学習プランを作成
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}