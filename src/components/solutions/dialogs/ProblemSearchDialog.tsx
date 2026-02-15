'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchProblems } from '@/lib/actions/problem';

interface Problem {
  id: string;
  name: string;
  firstContestId: string;
}

interface ProblemSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProblemSearchDialog({ open, onOpenChange }: ProblemSearchDialogProps) {
  const [search, setSearch] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedSearch) {
      setProblems([]);
      return;
    }

    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const results = await searchProblems(debouncedSearch);
        setProblems(results);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [debouncedSearch]);

  const handleSelect = (problemId: string) => {
    onOpenChange(false);
    router.push(`/solutions/${problemId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>記録する問題を選択</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="問題名、またはIDで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            )}

            {!isLoading && problems.length === 0 && search && (
              <p className="text-center py-8 text-sm text-slate-500">
                問題が見つかりませんでした。
              </p>
            )}

            {problems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => handleSelect(problem.id)}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group flex flex-col gap-1"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                  {problem.firstContestId}
                </span>
                <span className="font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {problem.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
