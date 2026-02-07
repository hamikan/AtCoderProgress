'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ProblemListFilters } from '@/lib/services/db/problem';
import { AvailableTag } from '@/lib/services/db/tag'


interface ProblemsFiltersProps {
  filters: ProblemListFilters;
  availableTags: AvailableTag[];
}

export default function ProblemsFilters({ filters, availableTags }: ProblemsFiltersProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const [range, setRange] = useState([filters.difficulty_min ?? 0, filters.difficulty_max ?? 4000]);

  useEffect(() => {
    const min = filters.difficulty_min ?? 0;
    const max = filters.difficulty_max ?? 4000;
    setRange(prev => {
      if (prev[0] === min && prev[1] === max) return prev;
      return [min, max];
    });
  }, [filters.difficulty_min, filters.difficulty_max]);

  const handleQueryChange = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleTagToggle = (tagName: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    handleQueryChange({ tags: newTags.length > 0 ? newTags.join(',') : null });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm ring-1 ring-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="問題名 / IDで検索..."
          defaultValue={filters.search || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleQueryChange({ search: (e.target as HTMLInputElement).value });
            }
          }}
        />
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(value) => handleQueryChange({ status: value === 'all' ? null : value })}
        >
          <SelectTrigger><SelectValue placeholder="解答ステータス" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのステータス</SelectItem>
            <SelectItem value="ac">AC</SelectItem>
            <SelectItem value="trying">挑戦中</SelectItem>
            <SelectItem value="unsolved">未解答</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.contestType || 'all'} 
          onValueChange={(value) => handleQueryChange({ contestType: value === 'all' ? null : value })}
        >
          <SelectTrigger><SelectValue placeholder="コンテストタイプ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのコンテスト</SelectItem>
            <SelectItem value="abc">ABC</SelectItem>
            <SelectItem value="arc">ARC</SelectItem>
            <SelectItem value="agc">AGC</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Select 
            value={filters.orderBy || 'problemName'} 
            onValueChange={(value) => handleQueryChange({ orderBy: value })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="difficulty">難易度</SelectItem>
              <SelectItem value="problemName">問題名</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.order || 'asc'} 
            onValueChange={(value) => handleQueryChange({ order: value })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">昇順</SelectItem>
              <SelectItem value="desc">降順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-2">
        <label className="block text-sm font-medium text-slate-700 mb-4">
          難易度範囲: {range[0]} ~ {range[1]}
        </label>
        <Slider
          min={0}
          max={4000}
          step={100}
          value={range}
          onValueChange={setRange}
          onValueCommit={(value) => {
            handleQueryChange({
              difficulty_min: value[0].toString(),
              difficulty_max: value[1].toString()
            });
          }}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">タグで絞り込み</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={(filters.tags || []).includes(tag.name) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => handleTagToggle(tag.name)}
            >
              {tag.name}
              {(filters.tags || []).includes(tag.name) && <X className="ml-1.5 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
