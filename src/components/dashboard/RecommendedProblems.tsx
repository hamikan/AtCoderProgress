import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Star, Clock, Target, TrendingUp } from 'lucide-react';
import { getDifficultyColor } from '@/lib/utils';

export default function RecommendedProblems() {
  const recommendedProblems = [
    {
      id: 'abc301_d',
      title: 'Bitmask',
      contest: 'AtCoder Beginner Contest 301',
      difficulty: 1200,
      tags: ['ビット演算', '全探索'],
      reason: 'ビット演算が苦手分野として特定されました',
      priority: 'high',
      estimatedTime: '30分',
      successRate: '65%',
    },
    {
      id: 'abc298_c',
      title: 'Cards Query Problem',
      contest: 'AtCoder Beginner Contest 298',
      difficulty: 1100,
      tags: ['データ構造', 'map'],
      reason: 'データ構造の理解を深めるのに最適です',
      priority: 'medium',
      estimatedTime: '25分',
      successRate: '72%',
    },
    {
      id: 'abc295_d',
      title: 'Three Days Ago',
      contest: 'AtCoder Beginner Contest 295',
      difficulty: 1300,
      tags: ['文字列', 'ハッシュ'],
      reason: '文字列処理のスキル向上におすすめ',
      priority: 'medium',
      estimatedTime: '35分',
      successRate: '58%',
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

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              あなたにおすすめの問題
            </CardTitle>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            AI推薦
          </Badge>
        </div>
        <p className="text-sm text-slate-600">
          苦手分野の分析結果に基づいて、最適な問題を提案しています
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedProblems.map((problem, index) => (
          <div
            key={problem.id}
            className="group relative rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge
                    className={`text-xs ${getPriorityColor(problem.priority)}`}
                  >
                    {problem.priority === 'high' ? '最優先' : '推奨'}
                  </Badge>
                  <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                
                <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                  {problem.title}
                </h3>
                
                <p className="text-sm text-slate-600">{problem.contest}</p>
                
                <div className="flex flex-wrap gap-1">
                  {problem.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-sm text-slate-600 italic">{problem.reason}</p>
                
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>予想時間: {problem.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>成功率: {problem.successRate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  解く
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="h-3 w-3 mr-1" />
                  保存
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-slate-200">
          <Button variant="outline" className="w-full">
            さらに問題を見る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}