import { cn, getDifficultyColor } from '@/lib/utils';
import { ExternalLink, Edit3, Target } from 'lucide-react';
import { RecommendedProblem } from '@/lib/services/db/stats';

interface RecommendedProblemsProps {
  className?: string;
  data: {
    unsolved: RecommendedProblem[];
    solved: RecommendedProblem[];
  };
}

export default function RecommendedProblems({ className, data }: RecommendedProblemsProps) {
  const { solved, unsolved } = data;

  const ProblemRow = ({ problem, isLast = false }: { problem: RecommendedProblem, isLast?: boolean }) => {
    const colorClass = getDifficultyColor(problem.difficulty);
    // Extract hex code: "text-[#FF0000]" -> "#FF0000"
    const colorHex = colorClass.match(/text-\[(.*?)\]/)?.[1] || '#808080';
    const difficultyLabel = problem.difficulty ?? '-';
    // Construct URL (AtCoder link) - Assuming 'id' is like 'abc123_a'
    // Problem contest ID might be extracted or passed.
    // Ideally use problem.contestId to build URL.
    // URL format: https://atcoder.jp/contests/{contestId}/tasks/{id}
    const url = `https://atcoder.jp/contests/${problem.contestId}/tasks/${problem.id}`;

    return (
      <div className={cn(
        "px-6 py-5 flex items-center justify-between hover:bg-background-light/50 dark:hover:bg-white/5 transition-colors group",
        !isLast && "border-b border-background-light dark:border-white/5"
      )}>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-sm font-semibold px-2.5 py-0.5 rounded-lg",
                colorClass,
                `bg-[${colorHex}]/10`
              )}
            >
              {difficultyLabel}
            </span>
            <a href={url} target="_blank" rel="noreferrer">
              <h3 className="text-[15px] font-semibold text-[#111818] dark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-1 break-all">
                {problem.name}
              </h3>
            </a>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[11px] font-medium tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded">
              {problem.reason}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 ml-4 text-slate-400 dark:text-slate-600 shrink-0">
          <a href={url} target="_blank" rel="noreferrer" title="Open problem">
            <ExternalLink className="w-[18px] h-[18px] hover:text-primary cursor-pointer transition-colors" />
          </a>
          <a href={`/problems/${problem.id}`} title="Write solution">
            <Edit3 className="w-[18px] h-[18px] hover:text-primary cursor-pointer transition-colors" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "w-full bg-white dark:bg-[#1a2e2e] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-primary/10 overflow-hidden flex flex-col h-auto",
      className
    )}>
      {/* Header Section */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-background-light dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Target className="text-emerald-500 w-6 h-6" />
          <h2 className="text-lg font-bold text-[#111818] dark:text-white">次解くべき問題</h2>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <div className="flex flex-col">
          {/* Section: AC済み */}
          {solved.length > 0 && (
            <>
              <div className="px-6 py-2 bg-background-light/30 dark:bg-white/5 border-b border-background-light dark:border-white/5 bg-green-50 dark:bg-green-900/20 sticky top-0 z-10 backdrop-blur-sm">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">AC済み (復習)</span>
              </div>
              {solved.map((problem) => (
                <ProblemRow key={problem.id} problem={problem} />
              ))}
            </>
          )}

          {/* Section: 未AC */}
          {unsolved.length > 0 && (
            <>
              <div className="px-6 py-2 bg-background-light/30 dark:bg-white/5 border-t border-b border-background-light dark:border-white/5 bg-yellow-50 dark:bg-yellow-900/20 sticky top-0 z-10 backdrop-blur-sm">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">未AC (挑戦)</span>
              </div>
              {unsolved.map((problem, index) => (
                <ProblemRow key={problem.id} problem={problem} isLast={index === unsolved.length - 1} />
              ))}
            </>
          )}

          {solved.length === 0 && unsolved.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              推奨問題が見つかりませんでした。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}