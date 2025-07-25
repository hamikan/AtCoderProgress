'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Tag } from '@/types/tag';

interface ProblemsFiltersProps {
  searchParams: { [key: string]: string | undefined };
  availableTags: Tag[];
}

export default function ProblemsFilters({ searchParams, availableTags }: ProblemsFiltersProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const handleQueryChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // フィルター変更時は1ページ目に戻す
    router.push(`?${params.toString()}`);
  };

  const handleTagToggle = (tagName: string) => {
    const currentTags = searchParams.tags?.split(',') || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    handleQueryChange('tags', newTags.length > 0 ? newTags.join(',') : null);
  };

  const difficultyRange = [
    parseInt(searchParams.difficulty_min || '0'),
    parseInt(searchParams.difficulty_max || '4000')
  ];

  const selectedTags = searchParams.tags?.split(',') || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm ring-1 ring-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="問題名 / コンテストIDで検索..."
          defaultValue={searchParams.search || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleQueryChange('search', (e.target as HTMLInputElement).value);
            }
          }}
        />
        <Select value={searchParams.status || 'all'} onValueChange={(value) => handleQueryChange('status', value === 'all' ? null : value)}>
          <SelectTrigger><SelectValue placeholder="解答ステータス" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのステータス</SelectItem>
            <SelectItem value="ac">AC</SelectItem>
            <SelectItem value="trying">挑戦中</SelectItem>
            <SelectItem value="unsolved">未解答</SelectItem>
          </SelectContent>
        </Select>
        <Select value={searchParams.contest_type || 'all'} onValueChange={(value) => handleQueryChange('contest_type', value === 'all' ? null : value)}>
          <SelectTrigger><SelectValue placeholder="コンテストタイプ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのコンテスト</SelectItem>
            <SelectItem value="abc">ABC</SelectItem>
            <SelectItem value="arc">ARC</SelectItem>
            <SelectItem value="agc">AGC</SelectItem>
            <SelectItem value="ahc">AHC</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Select value={searchParams.sort || 'difficulty'} onValueChange={(value) => handleQueryChange('sort', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="difficulty">難易度</SelectItem>
              <SelectItem value="name">問題名</SelectItem>
              <SelectItem value="contest_id">コンテスト</SelectItem>
              <SelectItem value="solutions">解答数</SelectItem>
            </SelectContent>
          </Select>
          <Select value={searchParams.order || 'asc'} onValueChange={(value) => handleQueryChange('order', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">昇順</SelectItem>
              <SelectItem value="desc">降順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          難易度範囲: {difficultyRange[0]} ~ {difficultyRange[1]}
        </label>
        <Slider
          min={0}
          max={4000}
          step={100}
          value={difficultyRange}
          onValueCommit={(value) => {
            handleQueryChange('difficulty_min', value[0].toString());
            handleQueryChange('difficulty_max', value[1].toString());
          }}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">タグで絞り込み</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag.name)}
            >
              {tag.name}
              {selectedTags.includes(tag.name) && <X className="ml-1.5 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}