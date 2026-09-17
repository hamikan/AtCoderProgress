'use client';

import { useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_PROBLEM_SEARCH_QUERY_LENGTH } from '@/features/problems/functions/normalize-problem-search';
import type { ProblemSearchResult } from '@/features/problems/types';

interface ProblemInlineSearchProps {
  onSelectProblem: (problemId: string) => void;
  results: ProblemSearchResult[];
  initialQuery?: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

export default function ProblemInlineSearch({
  onSelectProblem,
  results,
  initialQuery = '',
  title = '記録する問題を選択',
  description = '問題名または ID で検索して、解法記録を紐づける問題を選んでください。',
  placeholder = 'abc301_d / 問題名',
}: ProblemInlineSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams.toString());
    const normalizedQuery = query.trim();

    if (normalizedQuery.length >= 2) {
      nextParams.set('problemSearch', normalizedQuery);
    } else {
      nextParams.delete('problemSearch');
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="記録する問題を検索"
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={MAX_PROBLEM_SEARCH_QUERY_LENGTH}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">検索</Button>
      </form>

      {initialQuery.length > 0 && initialQuery.length < 2 && (
        <p className="py-2 text-sm text-slate-400">2文字以上入力すると検索できます。</p>
      )}

      {initialQuery.length >= 2 && results.length === 0 && (
        <p className="py-2 text-sm text-slate-500">一致する問題が見つかりませんでした。</p>
      )}

      {results.length > 0 && (
        <div className="max-h-72 space-y-2 overflow-y-auto" role="listbox" aria-label="問題検索結果">
          {results.map((problem) => (
            <button
              key={problem.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => onSelectProblem(problem.id)}
              className="flex w-full flex-col gap-1 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {problem.firstContestId} / {problem.id}
              </span>
              <span className="text-sm font-semibold text-slate-900">{problem.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
