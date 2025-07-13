'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  Code, 
  Heart, 
  Radar, 
  Trophy,
  Users
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: '弱点克服・問題推薦システム',
      description: 'あなたの実力に最適な問題を提示します。',
      badge: '', // 新機能の追加をしたらNEWなどのバッチを入れる
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: BarChart3,
      title: 'インテリジェントダッシュボード',
      description: 'AC数、現在レート、アルゴリズムごとのAC数を一目で確認。成長の軌跡を可視化します。',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Code,
      title: '解法記録・管理機能',
      description: 'コードや思考メモを記録し、ステータス管理でACまでの道のりを追跡できます。',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
    {
      icon: Radar,
      title: 'アルゴリズム分析',
      description: 'レーダーチャートで得意・不得意分野を可視化。自分でタグ付けも可能です。',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Calendar,
      title: 'カレンダーヒートマップ',
      description: 'GitHubライクな草表示で日々の精進を可視化。継続のモチベーションアップに。',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      title: 'ソーシャル機能',
      description: '解法の共有、お気に入り機能で他のユーザーとの交流と学び合いを促進。',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const additionalFeatures = [
    '🔗 AtCoder ID連携',
    '📊 リアルタイムレート取得',
    '🏷️ カスタムタグ機能',
    '💾 (未)自動データバックアップ',
    '🌙 (未)ダークモード対応',
    '📱 (未)モバイル最適化',
  ];

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            成長を加速する
            <span className="bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              豊富な機能
            </span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            AtCoderの精進に必要なすべての機能を提供します。
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">その他の充実機能</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {additionalFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white p-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              今すぐ始めて、競技プログラミングのスキルを次のレベルへ
            </h3>
            <p className="text-slate-600 mb-8">
              無料プランでも十分な機能をご利用いただけます。プレミアム機能で更なる成長を目指しましょう。
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-slate-600 to-slate-800 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:from-slate-700 hover:to-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
                <Trophy className="mr-2 h-4 w-4" />
                無料アカウント作成
              </button>
              <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
                <Heart className="mr-2 h-4 w-4" />
                プレミアムプランを見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}