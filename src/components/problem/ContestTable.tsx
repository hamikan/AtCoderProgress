'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, XCircle, ExternalLink, Eye, BookOpen } from 'lucide-react';
import { Contest } from '@/types/contest';
import { Pagination } from '@/components/ui/pagination';

interface ContestTableProps {
  contests: Contest[];
  problemIndexes: string[];
  totalProblems: number;
}

// const getUserSolutionStatus = (problem: Problem) => {
//   if (problem.solutions && problem.solutions.length > 0) {
//     return problem.solutions[0].status;
//   }
//   if (problem.submissions && problem.submissions.some(sub => sub.result === 'AC')) {
//     return 'SELF_AC';
//   }
//   return null;
// };

// const getProblemTags = (problem: Problem) => {
//   if (!problem.solutions) return [];
//   const tags = new Set<string>();
//   problem.solutions.forEach(solution => {
//     solution.tags.forEach(solutionTag => {
//       tags.add(solutionTag.tag.name);
//     });
//   });
//   return Array.from(tags);
// };

export default function ContestTable({ contests, problemIndexes, totalProblems }: ContestTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // const totalPages = Math.ceil(totalProblems / itemsPerPage);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'SELF_AC':
      case 'REVIEW_AC':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'EXPLANATION_AC':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'TRYING':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <XCircle className="h-4 w-4 text-slate-300" />;
    }
  };

  const getDifficultyColor = (difficulty: number | null) => {
    if (difficulty === null) return 'text-slate-400';
    if (difficulty < 400) return 'text-gray-600';
    if (difficulty < 800) return 'text-amber-600';
    if (difficulty < 1200) return 'text-emerald-600';
    if (difficulty < 1600) return 'text-blue-600';
    if (difficulty < 2000) return 'text-purple-600';
    if (difficulty < 2400) return 'text-red-600';
    return 'text-red-800';
  };

  return (
    <TooltipProvider>
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">
            コンテスト一覧 ({totalProblems}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4"> {/* <CardContent className="space-y-4"> にしても良さそう？ */}
            <div className="rounded-lg border border-slate-200 overflow-hidden"> {/* overflow-hiden の効果を調べる */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-48">コンテスト</TableHead>
                    {problemIndexes.map(problemIndex => <TableHead key={problemIndex} className="w-16 text-center">{problemIndex}</TableHead>)}
                    <TableHead className="w-32">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contests.map((contest) => (
                    <TableRow key={contest.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`https://atcoder.jp/contests/${contest.id}`}
                            target="_blank"
                            className="font-medium text-slate-900 hover:underline">{contest.name.toUpperCase()}
                          </Link>
                        </div>
                      </TableCell>
                      {problemIndexes.map((problemIndex) => {
                        const problem = contest.problems[problemIndex];
                        return (
                          <TableCell key={problemIndex} className="text-center">
                            {problem ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 relative as-child"
                                  >
                                    <Link href={`/problems/${problem.id}`}>
                                      {/* <div className="absolute inset-0 flex items-center justify-center">
                                        {getStatusIcon(getUserSolutionStatus(problem))}
                                      </div> */}
                                      <div className="max-w-xs">
                                        <div className={`font-medium truncate ${getDifficultyColor(problem.difficulty)}`}>
                                          {problem.name}
                                        </div>
                                      </div>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 p-1">
                                    <div className="font-medium">{problem.name}</div>
                                    <div className="text-xs">Difficulty: <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty ?? 'N/A'}</span></div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {/* {getProblemTags(problem).map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))} */}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <div className="flex items-center space-x-1">
                           <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`https://atcoder.jp/contests/${contest.id}`} target="_blank">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>AtCoderで見る</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            /> */}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}