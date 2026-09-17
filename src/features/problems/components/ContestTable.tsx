'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDifficultyColor } from '@/lib/atcoder/difficulty';
import type { Contest, ContestKind, ContestOrder, Problem } from '@/features/problems/types';
import type { SubmissionStatus } from '@/features/submissions/types';

interface ContestTableProps {
  contests: Contest[];
  contestType: ContestKind;
  order: ContestOrder;
  problemIndexes: string[];
  submissionStatusMap: Record<string, SubmissionStatus>;
  footer?: ReactNode;
}

export default function ContestTable({
  contests,
  contestType,
  footer,
  order,
  problemIndexes,
  submissionStatusMap,
}: ContestTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.delete('cursor');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex-grow">
      <TooltipProvider>
        <Card className="flex min-h-screen border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex space-x-4">
              <CardTitle className="text-lg text-slate-900">
                AtCoder {getContestName(contestType)} Contest
              </CardTitle>
              <Select
                value={contestType}
                onValueChange={(value) => handleValueChange('contestType', value)}
              >
                <SelectTrigger><SelectValue placeholder="Select a contest" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Contests</SelectLabel>
                    <SelectItem value="abc">ABC</SelectItem>
                    <SelectItem value="arc">ARC</SelectItem>
                    <SelectItem value="agc">AGC</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={order} onValueChange={(value) => handleValueChange('order', value)}>
                <SelectTrigger><SelectValue placeholder="Select by..." /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Order</SelectLabel>
                    <SelectItem value="asc">昇順</SelectItem>
                    <SelectItem value="desc">降順</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="w-full">
            <div className="rounded-lg border border-slate-200">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-20 text-center">コンテスト</TableHead>
                    {problemIndexes.map((problemIndex) => (
                      <TableHead key={problemIndex} className="w-28 border-l text-center">
                        {problemIndex}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="overflow-x-auto">
                  {contests.map((contest) => (
                    <TableRow key={contest.id} className="hover:bg-slate-50">
                      <TableCell className="text-center">
                        <Link
                          href={`https://atcoder.jp/contests/${contest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {contest.id.toUpperCase()}
                        </Link>
                      </TableCell>
                      {problemIndexes.map((requestedIndex) => {
                        const { problem, problemIndex } = findProblem(contest, requestedIndex);
                        return (
                          <TableCell
                            key={requestedIndex}
                            className={`border-l text-left ${
                              problem
                                ? getCellBackground(
                                    submissionStatusMap[problem.id],
                                    contest.startEpochSecond,
                                    contest.durationSecond
                                  )
                                : ''
                            }`}
                          >
                            {problem ? (
                              <Tooltip disableHoverableContent>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={`https://atcoder.jp/contests/${contest.id}/tasks/${problem.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <div className="w-full">
                                      <div className={`fade-out-text font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                        {problemIndex} - {problem.name}
                                      </div>
                                    </div>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 p-1">
                                    <div className="font-medium">{problem.name}</div>
                                    <div className="text-xs">Difficulty: {problem.difficulty ?? 'N/A'}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {footer}
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
}

function findProblem(
  contest: Contest,
  requestedIndex: string
): { problem: Problem | null; problemIndex: string } {
  const problemIndex = requestedIndex.split('/').findLast(
    (candidate) => Boolean(contest.problems[candidate])
  );
  return {
    problem: problemIndex ? contest.problems[problemIndex] ?? null : null,
    problemIndex: problemIndex ?? requestedIndex,
  };
}

function getCellBackground(
  submission: SubmissionStatus | undefined,
  startEpochSecond: number,
  durationSecond: number
): string {
  if (!submission?.result || submission.epochSecond === undefined) return '';
  if (submission.result !== 'AC') return 'bg-yellow-100';

  const start = BigInt(startEpochSecond);
  const submittedAt = BigInt(submission.epochSecond);
  return start <= submittedAt && submittedAt < start + BigInt(durationSecond)
    ? 'bg-green-200'
    : 'bg-green-100';
}

function getContestName(contestType: ContestKind): string {
  if (contestType === 'abc') return 'Beginner';
  if (contestType === 'arc') return 'Regular';
  return 'Grand';
}
