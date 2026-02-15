import { cn } from '@/lib/utils';
import { ExternalLink, Edit3, Target } from 'lucide-react';

export default function RecommendedProblems({ className }: { className?: string }) {
  // Mock Data mimicking the user's HTML structure desires
  const solvedProblems = [
    {
      id: 'abc301_d',
      title: 'Maximum Subarray Sum',
      contest: 'AtCoder Beginner Contest 301',
      difficulty: 1450,
      color: '#00C0C0', // Cyan
      tags: ['DP', 'Greedy'],
      url: 'https://atcoder.jp/contests/abc301/tasks/abc301_d',
    },
    {
      id: 'abc298_c',
      title: 'Binary Tree Level Order',
      contest: 'AtCoder Beginner Contest 298',
      difficulty: 850,
      color: '#008000', // Green
      tags: ['BFS', 'Trees'],
      url: 'https://atcoder.jp/contests/abc298/tasks/abc298_c',
    },
  ];

  const unsolvedProblems = [
    {
      id: 'abc220_f',
      title: 'Shortest Path in Grid',
      contest: 'AtCoder Beginner Contest 220',
      difficulty: 2200,
      color: '#C0C000', // Yellow
      tags: ['Graphs', 'Dijkstra'],
      url: 'https://atcoder.jp/contests/abc220/tasks/abc220_f',
    },
    {
      id: 'abc255_e',
      title: 'Advanced Network Flow',
      contest: 'AtCoder Beginner Contest 255',
      difficulty: 2550,
      color: '#FF8000', // Orange
      tags: ['Network Flow', 'Optimization'],
      url: 'https://atcoder.jp/contests/abc255/tasks/abc255_e',
    },
  ];

  const ProblemRow = ({ problem, isLast = false }: { problem: any, isLast?: boolean }) => (
    <div className={cn(
      "px-6 py-5 flex items-center justify-between hover:bg-background-light/50 dark:hover:bg-white/5 transition-colors group",
      !isLast && "border-b border-background-light dark:border-white/5"
    )}>
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold px-2.5 py-0.5 rounded-lg"
            style={{ backgroundColor: `${problem.color}1A`, color: problem.color }} // 10% opacity hex if possible, or just use style
          >
            {problem.difficulty}
          </span>
          <a href={problem.url} target="_blank" rel="noreferrer">
            <h3 className="text-[15px] font-semibold text-[#111818] dark:text-white group-hover:text-primary transition-colors cursor-pointer">
              {problem.title}
            </h3>
          </a>
        </div>
        <div className="flex gap-2">
          {problem.tags.map((tag: string) => (
            <span key={tag} className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 ml-4 text-slate-400 dark:text-slate-600">
        <a href={problem.url} target="_blank" rel="noreferrer" title="Open problem">
          <ExternalLink className="w-[18px] h-[18px] hover:text-primary cursor-pointer transition-colors" />
        </a>
        <button title="Write solution">
          <Edit3 className="w-[18px] h-[18px] hover:text-primary cursor-pointer transition-colors" />
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "w-full bg-white dark:bg-[#1a2e2e] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-primary/10 overflow-hidden flex flex-col",
      className
    )}>
      {/* Header Section */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-background-light dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Target className="text-emerald-500 w-6 h-6" />
          <h2 className="text-lg font-bold text-[#111818] dark:text-white">次解くべき問題</h2>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col">
          {/* Section: AC済み */}
          <div className="px-6 py-2 bg-background-light/30 dark:bg-white/5 border-b border-background-light dark:border-white/5 bg-green-50 dark:bg-green-900/20">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">AC済み</span>
          </div>

          {solvedProblems.map((problem) => (
            <ProblemRow key={problem.id} problem={problem} />
          ))}

          {/* Section: 未AC */}
          <div className="px-6 py-2 bg-background-light/30 dark:bg-white/5 border-t border-b border-background-light dark:border-white/5 bg-yellow-50 dark:bg-yellow-900/20">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">未AC</span>
          </div>

          {unsolvedProblems.map((problem, index) => (
            <ProblemRow key={problem.id} problem={problem} isLast={index === unsolvedProblems.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}