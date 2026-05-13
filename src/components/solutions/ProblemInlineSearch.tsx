'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { searchProblems } from '@/lib/actions/problem';

interface ProblemSearchResult {
  id: string;
  name: string;
  firstContestId: string;
}

interface ProblemInlineSearchProps {
  onSelectProblem: (problemId: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
}

export default function ProblemInlineSearch({
  onSelectProblem,
  title = '記録する問題を選択',
  description = '問題名または ID で検索して、解法記録を紐づける問題を選んでください。',
  placeholder = 'abc301_d / 問題名',
}: ProblemInlineSearchProps) {
  const [search, setSearch] = useState('');
  const [problems, setProblems] = useState<ProblemSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setProblems([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    let isActive = true;

    const fetchProblems = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const results = await searchProblems(debouncedSearch);
        if (isActive) {
          setProblems(results);
        }
      } catch {
        if (isActive) {
          setProblems([]);
          setErrorMessage('問題検索に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchProblems();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch]);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="記録する問題を検索"
          placeholder={placeholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      <div className="min-h-8">
        {isLoading && (
          <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            <span>検索中...</span>
          </div>
        )}

        {!isLoading && errorMessage && (
          <p className="py-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && debouncedSearch.length > 0 && debouncedSearch.length < 2 && (
          <p className="py-2 text-sm text-slate-400">2文字以上入力すると検索できます。</p>
        )}

        {!isLoading && !errorMessage && debouncedSearch.length >= 2 && problems.length === 0 && (
          <p className="py-2 text-sm text-slate-500">一致する問題が見つかりませんでした。</p>
        )}

        {!isLoading && !errorMessage && problems.length > 0 && (
          <div className="max-h-72 space-y-2 overflow-y-auto" role="listbox" aria-label="問題検索結果">
            {problems.map((problem) => (
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
    </div>
  );
}
