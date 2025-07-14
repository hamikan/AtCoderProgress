'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, Target, Award, Crown, Star } from 'lucide-react';

export default function ComparisonBenchmark() {
  const ratingComparison = {
    currentRating: 1247,
    targetRating: 1400,
    progress: 68,
    sameRatingUsers: 2847,
    higherRatingUsers: 15623,
    percentile: 72,
  };

  const followingUsers = [
    {
      id: 1,
      name: 'competitive_master',
      avatar: '/avatars/user1.jpg',
      rating: 1456,
      acCount: 1823,
      recentGrowth: '+89',
      isFollowing: true,
      rank: 'Expert',
    },
    {
      id: 2,
      name: 'algorithm_ninja',
      avatar: '/avatars/user2.jpg',
      rating: 1389,
      acCount: 1567,
      recentGrowth: '+45',
      isFollowing: true,
      rank: 'Expert',
    },
    {
      id: 3,
      name: 'code_warrior',
      avatar: '/avatars/user3.jpg',
      rating: 1298,
      acCount: 1234,
      recentGrowth: '+23',
      isFollowing: true,
      rank: 'Specialist',
    },
    {
      id: 4,
      name: 'dp_enthusiast',
      avatar: '/avatars/user4.jpg',
      rating: 1189,
      acCount: 987,
      recentGrowth: '+67',
      isFollowing: false,
      rank: 'Pupil',
    },
  ];

  const leaderboard = [
    {
      rank: 1,
      name: 'tourist',
      rating: 3947,
      acCount: 2156,
      badge: 'Legendary Grandmaster',
    },
    {
      rank: 2,
      name: 'Benq',
      rating: 3789,
      acCount: 1987,
      badge: 'Legendary Grandmaster',
    },
    {
      rank: 3,
      name: 'Um_nik',
      rating: 3654,
      acCount: 1876,
      badge: 'Legendary Grandmaster',
    },
    {
      rank: 1247,
      name: 'yamada_taro (あなた)',
      rating: 1247,
      acCount: 1456,
      badge: 'Pupil',
      isCurrentUser: true,
    },
  ];

  const algorithmComparison = [
    {
      algorithm: 'DP',
      userScore: 85,
      averageScore: 67,
      topScore: 95,
      rank: 'above_average',
    },
    {
      algorithm: 'グラフ',
      userScore: 45,
      averageScore: 72,
      topScore: 94,
      rank: 'below_average',
    },
    {
      algorithm: '数学',
      userScore: 65,
      averageScore: 58,
      topScore: 89,
      rank: 'above_average',
    },
    {
      algorithm: 'ビット演算',
      userScore: 38,
      averageScore: 54,
      topScore: 87,
      rank: 'below_average',
    },
  ];

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legendary Grandmaster':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'International Grandmaster':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Grandmaster':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'International Master':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Master':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Candidate Master':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Expert':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Specialist':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Pupil':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Comparison Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">現在の順位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">#{ratingComparison.sameRatingUsers}</div>
            <p className="text-xs text-slate-600">全体ランキング</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">上位パーセンタイル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{ratingComparison.percentile}%</div>
            <p className="text-xs text-slate-600">全ユーザー中</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">目標まで</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {ratingComparison.targetRating - ratingComparison.currentRating}
            </div>
            <p className="text-xs text-slate-600">レート差</p>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>目標レート進捗</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                現在 {ratingComparison.currentRating} → 目標 {ratingComparison.targetRating}
              </span>
              <Badge variant="outline" className="text-xs">
                {ratingComparison.progress}%
              </Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${ratingComparison.progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-600">
              あと{ratingComparison.targetRating - ratingComparison.currentRating}レートで目標達成！
              現在のペースなら約3ヶ月で到達予定です。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Following Users Comparison */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>フォローユーザーとの比較</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {followingUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRankColor(user.rank)}>
                        {user.rank}
                      </Badge>
                      <span className="text-xs text-slate-500">Rating: {user.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{user.acCount}問</div>
                  <div className="text-xs text-emerald-600">{user.recentGrowth} (3ヶ月)</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Star className="h-4 w-4 mr-2" />
              新しいユーザーをフォロー
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Comparison */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span>アルゴリズム習熟度比較</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {algorithmComparison.map((alg, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">{alg.algorithm}</h3>
                  <Badge 
                    variant={alg.rank === 'above_average' ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {alg.rank === 'above_average' ? '平均以上' : '平均以下'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">あなた</span>
                    <span className="font-medium text-slate-900">{alg.userScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${alg.userScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>平均: {alg.averageScore}%</span>
                    <span>トップ: {alg.topScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Leaderboard */}
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <span>グローバルランキング</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.isCurrentUser 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'border border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.rank <= 3 && <Crown className="h-4 w-4" />}
                    {user.rank > 3 && user.rank}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${user.isCurrentUser ? 'text-blue-900' : 'text-slate-900'}`}>
                      {user.name}
                    </h3>
                    <Badge className={getRankColor(user.badge)}>
                      {user.badge}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">Rating: {user.rating}</div>
                  <div className="text-xs text-slate-600">{user.acCount}問 AC</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}