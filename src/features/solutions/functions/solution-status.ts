import type { SolutionStatus } from '@/features/solutions/types';

export const DEFAULT_SOLUTION_STATUS: SolutionStatus = 'UNSET';

export const SOLUTION_STATUS_OPTIONS = [
  {
    value: 'UNSET',
    label: '未設定',
    badgeClassName: 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50',
    dotClassName: 'bg-slate-300',
    textClassName: 'text-slate-500',
  },
  {
    value: 'TRYING',
    label: '挑戦中',
    badgeClassName: 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100',
    dotClassName: 'bg-amber-500',
    textClassName: 'text-amber-700',
  },
  {
    value: 'EXPLANATION_AC',
    label: '解説AC',
    badgeClassName: 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100',
    dotClassName: 'bg-blue-600',
    textClassName: 'text-blue-700',
  },
  {
    value: 'SELF_AC',
    label: '自力AC',
    badgeClassName: 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    dotClassName: 'bg-emerald-600',
    textClassName: 'text-emerald-700',
  },
  {
    value: 'REVIEW_AC',
    label: '復習AC',
    badgeClassName: 'border-purple-600 bg-purple-50 text-purple-700 hover:bg-purple-100',
    dotClassName: 'bg-purple-600',
    textClassName: 'text-purple-700',
  },
] as const satisfies ReadonlyArray<{
  value: SolutionStatus;
  label: string;
  badgeClassName: string;
  dotClassName: string;
  textClassName: string;
}>;

export function getSolutionStatusOption(status: SolutionStatus) {
  return SOLUTION_STATUS_OPTIONS.find((option) => option.value === status) ?? null;
}
