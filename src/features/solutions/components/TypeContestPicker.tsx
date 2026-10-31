'use client';

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getContestProblemList } from '@/features/solutions/actions/get-contest-problem-list';
import { getTypeContestOptions } from '@/features/solutions/actions/get-type-contest-options';
import ProblemOptionList from '@/features/solutions/components/ProblemOptionList';
import SidebarAddProblemButton from '@/features/solutions/components/SidebarAddProblemButton';
import {
  buildSolutionSidebarProblemOptions,
  filterSidebarContestOptions,
} from '@/features/solutions/functions/solution-sidebar-hierarchy';
import type {
  SolutionListItem,
  SolutionSidebarContestOption,
  SolutionSidebarContestProblem,
} from '@/features/solutions/types';

const MAX_VISIBLE_CONTESTS = 50;
const LOAD_ERROR_MESSAGE = '読み込めませんでした。';

type LoadState<Value> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; value: Value };

interface TypeContestPickerProps {
  type: string;
  solutions: SolutionListItem[];
  onSelectProblem: (contestId: string, problemId: string) => void;
}

function PickerMessage({ children }: { children: ReactNode }) {
  return <p className="px-2 py-3 text-center text-xs text-slate-400">{children}</p>;
}

export default function TypeContestPicker({
  type,
  solutions,
  onSelectProblem,
}: TypeContestPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [contests, setContests] = useState<LoadState<SolutionSidebarContestOption[]>>({
    status: 'idle',
  });
  const [selectedContest, setSelectedContest] = useState<SolutionSidebarContestOption | null>(
    null
  );
  const [problems, setProblems] = useState<LoadState<SolutionSidebarContestProblem[]>>({
    status: 'idle',
  });
  const latestProblemRequest = useRef(0);

  const recordedContestIds = useMemo(
    () => new Set(solutions.map((solution) => solution.contestId)),
    [solutions]
  );
  const visibleContests = useMemo(
    () =>
      contests.status === 'loaded'
        ? filterSidebarContestOptions(contests.value, query).slice(0, MAX_VISIBLE_CONTESTS)
        : [],
    [contests, query]
  );
  const problemOptions = useMemo(
    () =>
      problems.status === 'loaded'
        ? buildSolutionSidebarProblemOptions(problems.value, solutions)
        : [],
    [problems, solutions]
  );

  async function loadContests() {
    setContests({ status: 'loading' });
    try {
      const result = await getTypeContestOptions(type);
      setContests(
        result.ok
          ? { status: 'loaded', value: result.value }
          : { status: 'error', message: result.error.message }
      );
    } catch {
      setContests({ status: 'error', message: LOAD_ERROR_MESSAGE });
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      if (contests.status === 'idle' || contests.status === 'error') {
        void loadContests();
      }
      return;
    }

    latestProblemRequest.current += 1;
    setQuery('');
    setSelectedContest(null);
    setProblems({ status: 'idle' });
  }

  async function handleSelectContest(contest: SolutionSidebarContestOption) {
    latestProblemRequest.current += 1;
    const requestId = latestProblemRequest.current;
    setSelectedContest(contest);
    setProblems({ status: 'loading' });

    let nextProblems: LoadState<SolutionSidebarContestProblem[]>;
    try {
      const result = await getContestProblemList(contest.contestId);
      nextProblems = result.ok
        ? { status: 'loaded', value: result.value }
        : { status: 'error', message: result.error.message };
    } catch {
      nextProblems = { status: 'error', message: LOAD_ERROR_MESSAGE };
    }

    if (requestId === latestProblemRequest.current) {
      setProblems(nextProblems);
    }
  }

  function handleBack() {
    latestProblemRequest.current += 1;
    setSelectedContest(null);
    setProblems({ status: 'idle' });
  }

  function handleSelectProblem(problemId: string) {
    if (!selectedContest) return;
    handleOpenChange(false);
    onSelectProblem(selectedContest.contestId, problemId);
  }

  function handleQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !visibleContests[0]) return;
    event.preventDefault();
    void handleSelectContest(visibleContests[0]);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <SidebarAddProblemButton
          aria-label={`${type} の回と問題を選んで解法記録を追加`}
          title={`${type} の解法記録を追加`}
        />
      </PopoverTrigger>

      <PopoverContent side="right" align="start" className="w-72 gap-1 p-1">
        {selectedContest ? (
          <>
            <button
              type="button"
              autoFocus
              onClick={handleBack}
              className="flex items-center gap-1 rounded-md px-1 pb-1 pt-1.5 text-left text-xs font-semibold text-slate-500 outline-none hover:text-slate-900 focus-visible:text-slate-900"
            >
              <ChevronLeft className="size-3.5 shrink-0" />
              {type} {selectedContest.label || selectedContest.contestId} の問題
            </button>
            {problems.status === 'loaded' && problemOptions.length > 0 && (
              <ProblemOptionList options={problemOptions} onSelect={handleSelectProblem} />
            )}
            {problems.status === 'loaded' && problemOptions.length === 0 && (
              <PickerMessage>問題が見つかりません</PickerMessage>
            )}
            {problems.status === 'loading' && <PickerMessage>読み込み中…</PickerMessage>}
            {problems.status === 'error' && <PickerMessage>{problems.message}</PickerMessage>}
          </>
        ) : (
          <>
            <p className="px-2 pb-1 pt-1.5 text-xs font-semibold text-slate-500">
              {type} の回を選択
            </p>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleQueryKeyDown}
              aria-label={`${type} の回を絞り込み`}
              placeholder="番号や日付で絞り込み"
              className="h-8 text-sm"
            />
            {contests.status === 'loaded' && visibleContests.length > 0 && (
              <ul className="max-h-72 overflow-y-auto">
                {visibleContests.map((contest) => (
                  <li key={contest.contestId}>
                    <button
                      type="button"
                      onClick={() => void handleSelectContest(contest)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {contest.label || contest.contestId}
                      </span>
                      {recordedContestIds.has(contest.contestId) && (
                        <Check aria-label="記録あり" className="size-3.5 shrink-0 text-emerald-600" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {contests.status === 'loaded' && visibleContests.length === 0 && (
              <PickerMessage>一致する回がありません</PickerMessage>
            )}
            {(contests.status === 'idle' || contests.status === 'loading') && (
              <PickerMessage>読み込み中…</PickerMessage>
            )}
            {contests.status === 'error' && <PickerMessage>{contests.message}</PickerMessage>}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
