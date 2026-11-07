import type { SolutionStatus } from '@/features/solutions/types';

export const SOLUTION_STATUS_OPTIONS = [
  {
    value: 'SELF_AC',
    label: '自力AC',
    selectedClassName: 'border-emerald-600 bg-emerald-50 text-emerald-700',
    textClassName: 'text-emerald-700',
  },
  {
    value: 'EXPLANATION_AC',
    label: '解説AC',
    selectedClassName: 'border-blue-600 bg-blue-50 text-blue-700',
    textClassName: 'text-blue-700',
  },
  {
    value: 'REVIEW_AC',
    label: '復習AC',
    selectedClassName: 'border-teal-600 bg-teal-50 text-teal-700',
    textClassName: 'text-teal-700',
  },
  {
    value: 'AC',
    label: 'AC',
    selectedClassName: 'border-emerald-600 bg-emerald-50 text-emerald-700',
    textClassName: 'text-emerald-700',
  },
  {
    value: 'TRYING',
    label: '挑戦中',
    selectedClassName: 'border-amber-500 bg-amber-50 text-amber-700',
    textClassName: 'text-amber-700',
  },
] as const satisfies ReadonlyArray<{
  value: SolutionStatus;
  label: string;
  selectedClassName: string;
  textClassName: string;
}>;

export function getSolutionStatusOption(status: SolutionStatus) {
  return SOLUTION_STATUS_OPTIONS.find((option) => option.value === status) ?? null;
}
