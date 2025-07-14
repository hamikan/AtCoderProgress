'use client';

import { useState } from 'react';
import GrowthTrends from '@/components/analytics/GrowthTrends';
import AlgorithmAnalysis from '@/components/analytics/AlgorithmAnalysis';
import ActivityPatterns from '@/components/analytics/ActivityPatterns';
import ComparisonBenchmark from '@/components/analytics/ComparisonBenchmark';
import LearningEfficiency from '@/components/analytics/LearningEfficiency';
import GoalPrediction from '@/components/analytics/GoalPrediction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, Users, Zap, Calendar, Brain } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">成長分析ダッシュボード</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            あなたの競技プログラミングの成長を多角的に分析し、より効率的な学習戦略を提案します
          </p>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="growth" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="growth" className="flex items-center space-x-2 py-3">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">成長トレンド</span>
            </TabsTrigger>
            <TabsTrigger value="algorithm" className="flex items-center space-x-2 py-3">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">アルゴリズム</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">活動パターン</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center space-x-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">比較分析</span>
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="flex items-center space-x-2 py-3">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">学習効率</span>
            </TabsTrigger>
            <TabsTrigger value="prediction" className="flex items-center space-x-2 py-3">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">目標予測</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="space-y-8">
            <GrowthTrends selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
          </TabsContent>

          <TabsContent value="algorithm" className="space-y-8">
            <AlgorithmAnalysis />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-8">
            <ActivityPatterns />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <ComparisonBenchmark />
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-8">
            <LearningEfficiency />
          </TabsContent>

          <TabsContent value="prediction" className="space-y-8">
            <GoalPrediction />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}