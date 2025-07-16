'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

export default function AlgorithmAnalysis() {
  const algorithmStats = [
    {
      name: 'DP',
      totalProblems: 156,
      acProblems: 132,
      accuracy: 85,
      trend: 'up',
      recentImprovement: 12,
      averageDifficulty: 1180,
      status: 'strong',
    },
    {
      name: '全探索',
      totalProblems: 89,
      acProblems: 69,
      accuracy: 78,
      trend: 'up',
      recentImprovement: 8,
      averageDifficulty: 950,
      status: 'good',
    },
    {
      name: '二分探索',
      totalProblems: 67,
      acProblems: 48,
      accuracy: 72,
      trend: 'stable',
      recentImprovement: 2,
      averageDifficulty: 1250,
      status: 'good',
    },
    {
      name: 'グラフ',
      totalProblems: 78,
      acProblems: 35,
      accuracy: 45,
      trend: 'down',
      recentImprovement: -5,
      averageDifficulty: 1400,
      status: 'weak',
    },
    {
      name: 'ビット演算',
      totalProblems: 45,
      acProblems: 17,
      accuracy: 38,
      trend: 'down',
      recentImprovement: -3,
      averageDifficulty: 1300,
      status: 'weak',
    },
    {
      name: '数学',
      totalProblems: 92,
      acProblems: 60,
      accuracy: 65,
      trend: 'up',
      recentImprovement: 5,
      averageDifficulty: 1100,
      status: 'average',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strong':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'average':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'weak':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'strong':
        return '得意';
      case 'good':
        return '良好';
      case 'average':
        return '普通';
      case 'weak':
        return '要改善';
      default:
        return '未評価';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-slate-400 rounded-full" />;
    }
  };

  const strongAlgorithms = algorithmStats.filter(alg => alg.status === 'strong' || alg.status === 'good');
  const weakAlgorithms = algorithmStats.filter(alg => alg.status === 'weak');

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">得意分野</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{strongAlgorithms.length}</div>
            <p className="text-xs text-slate-600">アルゴリズム</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">要改善分野</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{weakAlgorithms.length}</div>
            <p className="text-xs text-slate-600">アルゴリズム</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">平均正答率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(algorithmStats.reduce((sum, alg) => sum + alg.accuracy, 0) / algorithmStats.length)}%
            </div>
            <p className="text-xs text-slate-600">全アルゴリズム</p>
          </CardContent>
        </Card>
      </div>

      {/* Algorithm Performance Table */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>アルゴリズム別詳細分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {algorithmStats.map((algorithm, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-slate-900">{algorithm.name}</h3>
                    <Badge className={getStatusColor(algorithm.status)}>
                      {getStatusLabel(algorithm.status)}
                    </Badge>
                    {getTrendIcon(algorithm.trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">{algorithm.accuracy}%</div>
                    <div className="text-xs text-slate-600">正答率</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">進捗</span>
                    <span className="text-slate-900">{algorithm.acProblems}/{algorithm.totalProblems}問</span>
                  </div>
                  <Progress value={algorithm.accuracy} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">平均難易度: </span>
                      <span className="font-medium text-slate-900">{algorithm.averageDifficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">最近の変化: </span>
                      <span className={`font-medium ${algorithm.recentImprovement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {algorithm.recentImprovement >= 0 ? '+' : ''}{algorithm.recentImprovement}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strong Areas */}
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <span>得意分野の活用</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strongAlgorithms.slice(0, 3).map((algorithm, index) => (
              <div key={index} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <h4 className="font-medium text-emerald-900">{algorithm.name}</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  正答率{algorithm.accuracy}% - より高難易度の問題に挑戦してスキルを磨きましょう
                </p>
              </div>
            ))}
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              得意分野の問題を見る
            </Button>
          </CardContent>
        </Card>

        {/* Weak Areas */}
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>改善が必要な分野</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakAlgorithms.map((algorithm, index) => (
              <div key={index} className="p-3 rounded-lg bg-red-50 border border-red-200">
                <h4 className="font-medium text-red-900">{algorithm.name}</h4>
                <p className="text-sm text-red-700 mt-1">
                  正答率{algorithm.accuracy}% - 基礎から復習して理解を深めることをお勧めします
                </p>
              </div>
            ))}
            <Button className="w-full bg-red-600 hover:bg-red-700">
              弱点克服の問題を見る
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}