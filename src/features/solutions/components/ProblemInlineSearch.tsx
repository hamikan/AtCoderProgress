'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { findProblems } from '@/features/problems/actions/find-problems';
import { MAX_PROBLEM_SEARCH_QUERY_LENGTH } from '@/features/problems/functions/normalize-problem-search';
import type { ProblemSearchResult } from '@/features/problems/types';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

const MIN_QUERY_LENGTH = 2;

interface SearchResponse {
  query: string;
  results: ProblemSearchResult[];
  failed: boolean;
}

interface ProblemInlineSearchProps {
  onSelectProblem: (problemId: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  inputClassName?: string;
}

export default function ProblemInlineSearch({
  onSelectProblem,
  onCancel,
  autoFocus = false,
  title,
  description,
  placeholder = 'abc301_d / 問題名',
  inputClassName,
}: ProblemInlineSearchProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, 250);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }
    let cancelled = false;
    findProblems(debouncedQuery).then(
      (results) => {
        if (!cancelled) setResponse({ query: debouncedQuery, results, failed: false });
      },
      () => {
        if (!cancelled) setResponse({ query: debouncedQuery, results: [], failed: true });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const isQueryLongEnough = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const isSettled = response !== null && response.query === trimmedQuery;
  const results = isQueryLongEnough ? (response?.results ?? []) : [];

  return (
    <div className="space-y-3">
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-sm font-bold text-slate-900">{title}</h2>}
          {description && (
            <p className="text-xs leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="記録する問題を探す"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (isSettled && results[0]) {
                onSelectProblem(results[0].id);
              }
            } else if (event.key === 'Escape' && onCancel) {
              event.stopPropagation();
              onCancel();
            }
          }}
          maxLength={MAX_PROBLEM_SEARCH_QUERY_LENGTH}
          className={cn('pl-9 pr-9', inputClassName)}
        />
        {isQueryLongEnough && !isSettled && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH && (
        <p className="text-xs text-slate-400">2文字以上入れると候補が出ます。</p>
      )}

      {isSettled && !response.failed && results.length === 0 && (
        <p className="text-xs text-slate-500">一致する問題が見つかりませんでした。</p>
      )}

      {isSettled && response.failed && (
        <p role="alert" className="text-xs text-red-600">
          問題を探せませんでした。少し待ってから、もう一度入れてください。
        </p>
      )}

      {results.length > 0 && (
        <div className="max-h-72 space-y-1.5 overflow-y-auto" role="listbox" aria-label="問題の候補">
          {results.map((problem) => (
            <button
              key={problem.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => onSelectProblem(problem.id)}
              className="flex w-full flex-col gap-0.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-[11px] text-slate-400">
                {problem.firstContestId.toUpperCase()} / {problem.id}
              </span>
              <span className="text-sm font-medium text-slate-900">{problem.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
