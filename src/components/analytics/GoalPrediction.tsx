'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, TrendingUp, Lightbulb, CheckCircle, Clock } from 'lucide-react';

export default function GoalPrediction() {
  const currentStats = {
    rating: 1247,
    acCount: 1456,
    weeklyProblems: 12,
    monthlyGrowth: 23,
  };

  const goals = [
    {
      id: 1,
      title: 'レート1400達成',
      currentValue: 1247,
      targetValue: 1400,
      progress: 68,
      estimatedDays: 89,
      confidence: 85,
      status: 'on_track',
      requirements: [
        '週15問のペースを維持',
        'グラフ問題の正答率を60%以上に',
        'コンテスト参加率80%以上',
      ],
    },
    {
      id: 2,
      title: '生涯AC数2000問',
      currentValue: 1456,
      targetValue: 2000,
      progress: 73,
      estimatedDays: 136,
      confidence: 92,
      status: 'ahead',
      requirements: [
        '現在のペースを維持',
        '難易度800以上の問題を増やす',
      ],
    },
    {
      id: 3,
      title: 'グラフ問題正答率70%',
      currentValue: 45,
      targetValue: 70,
      progress: 64,
      estimatedDays: 156,
      confidence: 67,
      status: 'behind',
      requirements: [
        'グラフ基礎の復習',
        '週3問以上のグラフ問題',
        'DFS/BFSの実装練習',
      ],
    },
  ];

  const learningPlan = {
    nextWeek: [
      {
        day: '月',
        focus: 'DP復習',
        problems: 3,
        difficulty: '800-1200',
        estimated: '2時間',
      },
      {
        day: '火',
        focus: 'グラフ基礎',
        problems: 2,
        difficulty: '600-1000',
        estimated: '1.5時間',
      },
      {
        day: '水',
        focus: '二分探索',
        problems: 2,
        difficulty: '800-1200',
        estimated: '1.5時間',
      },
      {
        day: '木',
        focus: 'コンテスト',
        problems: 4,
        difficulty: '400-1400',
        estimated: '2時間',
      },
      {
        day: '金',
        focus: '復習',
        problems: 2,
        difficulty: '既習問題',
        estimated: '1時間',
      },
      {
        day: '土',
        focus: '新規分野',
        problems: 3,
        difficulty: '600-1000',
        estimated: '2時間',
      },
      {
        day: '日',
        focus: '解法記録',
        problems: 1,
        difficulty: '振り返り',
        estimated: '1時間',
      },
    ],
  };

  const milestones = [
    {
      date: '2024-08-15',
      title: 'レート1300突破予定',
      description: '現在のペースを維持すれば達成可能',
      confidence: 78,
    },
    {
      date: '2024-09-30',
      title: 'AC数1800問達成予定',
      description: '順調に進捗中',
      confidence: 89,
    },
    {
      date: '2024-11-15',
      title: 'レート1400達成予定',
      description: 'グラフ問題の改善が必要',
      confidence: 85,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'on_track':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'behind':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ahead':
        return '予定より早い';
      case 'on_track':
        return '順調';
      case 'behind':
        return '遅れ気味';
      default:
        return '未評価';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-600';
    if (confidence >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{goal.title}</CardTitle>
                <Badge className={getStatusColor(goal.status)}>
                  {getStatusLabel(goal.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{goal.currentValue}</span>
                <span className="text-sm text-slate-600">/ {goal.targetValue}</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">あと{goal.estimatedDays}日</span>
                <span className={`font-medium ${getConfidenceColor(goal.confidence)}`}>
                  信頼度: {goal.confidence}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Goal Analysis */}
      <div className="space-y-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>{goal.title}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(goal.status)}>
                    {getStatusLabel(goal.status)}
                  </Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(goal.confidence)}`}>
                    {goal.confidence}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <div className="text-lg font-semibold text-slate-900">{goal.currentValue}</div>
                  <div className="text-xs text-slate-600">現在</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50">
                  <div className="text-lg font-semibold text-purple-600">{goal.targetValue}</div>
                  <div className="text-xs text-purple-700">目標</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <div className="text-lg font-semibold text-blue-600">{goal.estimatedDays}日</div>
                  <div className="text-xs text-blue-700">予想達成日数</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>達成に必要な条件</span>
                </h4>
                <ul className="space-y-1">
                  {goal.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-slate-600 pl-4 relative">
                      <span className="absolute left-0 top-2 w-1 h-1 bg-slate-400 rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Plan */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span>来週の学習プラン</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {learningPlan.nextWeek.map((day, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-slate-900">{day.day}</h3>
                  <div className="text-sm text-blue-600 font-medium">{day.focus}</div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>{day.problems}問</div>
                    <div>{day.difficulty}</div>
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{day.estimated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">今週のポイント</span>
            </div>
            <p className="text-sm text-emerald-700">
              グラフ問題に重点を置いて、基礎から応用まで段階的に学習します。
              コンテスト参加で実戦経験を積み、復習で定着を図りましょう。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <span>予想マイルストーン</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                    <span className={`text-sm font-medium ${getConfidenceColor(milestone.confidence)}`}>
                      {milestone.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{milestone.description}</p>
                  <p className="text-xs text-slate-500">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Target className="h-4 w-4 mr-2" />
          新しい目標を設定
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          学習プランをカスタマイズ
        </Button>
      </div>
    </div>
  );
}