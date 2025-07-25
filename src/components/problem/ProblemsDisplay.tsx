'use client';

import ContestTable from './ContestTable';
// import ProblemsList from './ProblemsList';
// import ProblemsGrid from './ProblemsGrid';
import { Problem } from '@/types/problem';
import { Contest } from '@/types/contest';

interface ProblemsDisplayProps {
  problems: Problem[] | Contest[];
  problemIndexes: string[];
  totalProblems: number;
  viewMode: 'contest' | 'list' | 'grid';
  currentPage: number;
  itemsPerPage: number;
  searchParams: {
    search?: string;
    tags?: string;
    difficulty_min?: string;
    difficulty_max?: string;
    status?: string;
    contest_type?: string;
    sort?: string;
    order?: string;
    view?: string;
    page?: string;
  };
}

export default function ProblemsDisplay({
  problems,
  problemIndexes,
  totalProblems,
  viewMode,
  currentPage,
  itemsPerPage,
}: ProblemsDisplayProps) {
  const commonProps = {
    problems,
    problemIndexes,
    totalProblems,
    currentPage,
    itemsPerPage,
  };

  switch (viewMode) {
    case 'list':
      // return <ProblemsList {...commonProps} />;
    case 'grid':
      // return <ProblemsGrid {...commonProps} />;
    case 'contest':
    default:
      return <ContestTable　contests={problems as Contest[]} {...commonProps} />;
  }
}