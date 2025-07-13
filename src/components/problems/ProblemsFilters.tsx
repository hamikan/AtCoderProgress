'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';

interface ProblemsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  difficultyRange: number[];
  setDifficultyRange: (range: number[]) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  contestTypeFilter: string;
  setContestTypeFilter: (type: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export default function ProblemsFilters({
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  difficultyRange,
  setDifficultyRange,
  statusFilter,
  setStatusFilter,
  contestTypeFilter,
  setContestTypeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: ProblemsFiltersProps) {
  const algorithmTags = [
    'DP', '全探索', '二分探索', 'グラフ', 'ビット演算', '数学', '文字列', 
    'データ構造', '貪欲法', '実装', 'Union-Find', 'セグメント木', 'BFS', 
    'DFS', '最短経路', '最大流', '組み合わせ', '確率', 'ゲーム理論', 
    '累積和', '座標圧縮', 'しゃくとり法', '尺取り法', 'Mo\'s algorithm'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDifficultyRange([0, 3000]);
    setStatusFilter('all');
    setContestTypeFilter('all');
    setSortBy('difficulty');
    setSortOrder('asc');
  };

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardContent className="p-6 space-y-6">
        {/* Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="問題名、コンテスト名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>クリア</span>
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Contest Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">コンテスト</label>
            <Select value={contestTypeFilter} onValueChange={setContestTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="ABC">ABC</SelectItem>
                <SelectItem value="ARC">ARC</SelectItem>
                <SelectItem value="AGC">AGC</SelectItem>
                <SelectItem value="AHC">AHC</SelectItem>
                <SelectItem value="Other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">ステータス</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="ac">AC済み</SelectItem>
                <SelectItem value="trying">挑戦中</SelectItem>
                <SelectItem value="unsolved">未挑戦</SelectItem>
                <SelectItem value="explanation">解説AC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              難易度: {difficultyRange[0]} - {difficultyRange[1]}
            </label>
            <Slider
              value={difficultyRange}
              onValueChange={setDifficultyRange}
              max={3000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">並び順</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contest_id">コンテスト番号</SelectItem>
                <SelectItem value="difficulty">難易度</SelectItem>
                <SelectItem value="date">日付</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">順序</label>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full justify-start"
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="h-4 w-4 mr-2" />
                  昇順
                </>
              ) : (
                <>
                  <SortDesc className="h-4 w-4 mr-2" />
                  降順
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Algorithm Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              アルゴリズムタグ（みんなの解法から集計）
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  タグ選択 ({selectedTags.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium">解法で使われているアルゴリズム</h4>
                  <div className="flex flex-wrap gap-2">
                    {algorithmTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-slate-100"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}