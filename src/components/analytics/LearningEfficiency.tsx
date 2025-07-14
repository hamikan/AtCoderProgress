'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, BookOpen, Clock, Target, TrendingUp, Award } from 'lucide-react';

export default function LearningEfficiency() {
  const efficiencyMetrics = {
    studyTimeVsGrowth: {
      weeklyStudyHours: 12,
      ratingGrowthPerHour: 8.5,
      efficiency: 85,
      trend: 'up',
    },
    reviewEffectiveness: {
      reviewedProblems: 156,
      retentionRate: 78,
      improvementRate: 23,
      trend: 'up',
    },
    recommendationSuccess: {
      recommendedProblems: 89,
      completedProblems: 67,
      successRate: 75,
      averageTime: 28,
    },
  };

  const learningPatterns = [
    {
      pattern: '解法記録の質',
      score: 88,
      impact: 'high',
      description: '詳細な解法記録が成長に大きく寄与',
      recommendation: 'より多くの問題で解法記録を作成',
    },
    {
      pattern: '振り返り頻度',
      score: 65,
      impact: 'medium',
      description: '定期的な振り返りで定着率向上',
      recommendation: '週1回の振り返りタイムを設定',
    },
    {
      pattern: '推薦問題消化率',
      score: 75,
      impact: 'high',
      description: 'AI推薦問題の消化が効率的',
      recommendation: '推薦問題を優先的に解く',
    },
    {
      pattern: '苦手分野への取り組み',
      score: 42,
      impact: 'high',
      description: '苦手分野の回避傾向あり',
      recommendation: '苦手分野を意識的に学習',
    },
  ];

  const timeAllocation = [
    { category: '新規問題', hours: 8, percentage: 67, efficiency: 85 },
    { category: '復習', hours: 2, percentage: 17, efficiency: 92 },
    { category: '解法記録', hours: 1.5, percentage: 12, efficiency: 78 },
    { category: 'コンテスト', hours: 0.5, percentage: 4, efficiency: 95 },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Efficiency Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">学習効率スコア</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {efficiencyMetrics.studyTimeVsGrowth.efficiency}%
            </div>
            <p className="text-xs text-slate-600">時間対効果</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">復習定着率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {efficiencyMetrics.reviewEffectiveness.retentionRate}%
            </div>
            <p className="text-xs text-slate-600">復習効果</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">推薦成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {efficiencyMetrics.recommendationSuccess.successRate}%
            </div>
            <p className="text-xs text-slate-600">AI推薦精度</p>
          </CardContent>
        </Card>
      </div>

      {/* Study Time vs Growth */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>学習時間と成長の関係</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">週間学習時間</h3>
              <div className="text-3xl font-bold text-blue-600">
                {efficiencyMetrics.studyTimeVsGrowth.weeklyStudyHours}時間
              </div>
              <p className="text-sm text-slate-600">
                1時間あたり{efficiencyMetrics.studyTimeVsGrowth.ratingGrowthPerHour}レート成長
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">効率性トレンド</h3>
              <div className="h-24 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-4 flex items-center">
                <TrendingUp className="h-8 w-8 text-emerald-600 mr-4" />
                <div>
                  <div className="text-lg font-semibold text-emerald-600">向上中</div>
                  <div className="text-sm text-slate-600">効率が改善傾向</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Allocation */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>学習時間の配分</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeAllocation.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{item.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{item.hours}h</span>
                    <Badge variant="outline" className="text-xs">
                      効率: {item.efficiency}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  週間学習時間の{item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Patterns Analysis */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <span>学習パターン分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {learningPatterns.map((pattern, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-slate-900">{pattern.pattern}</h3>
                    <Badge className={getImpactColor(pattern.impact)}>
                      {pattern.impact === 'high' ? '高影響' : pattern.impact === 'medium' ? '中影響' : '低影響'}
                    </Badge>
                  </div>
                  <div className={`text-lg font-semibold ${getEfficiencyColor(pattern.score)}`}>
                    {pattern.score}%
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={pattern.score} className="h-2" />
                  <p className="text-sm text-slate-600">{pattern.description}</p>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600">{pattern.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Effectiveness */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span>復習効果分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-emerald-50">
              <div className="text-2xl font-bold text-emerald-600">
                {efficiencyMetrics.reviewEffectiveness.reviewedProblems}
              </div>
              <div className="text-sm text-emerald-700">復習済み問題数</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {efficiencyMetrics.reviewEffectiveness.retentionRate}%
              </div>
              <div className="text-sm text-blue-700">定着率</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                +{efficiencyMetrics.reviewEffectiveness.improvementRate}%
              </div>
              <div className="text-sm text-purple-700">改善率</div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-slate-50">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-slate-900">復習の効果</span>
            </div>
            <p className="text-sm text-slate-600">
              復習した問題の定着率は{efficiencyMetrics.reviewEffectiveness.retentionRate}%で、
              復習していない問題と比較して{efficiencyMetrics.reviewEffectiveness.improvementRate}%高い成功率を示しています。
              定期的な復習が学習効果を大幅に向上させています。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}