'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDifficultyColor } from '@/lib/colors';
import { Problem } from '@/types/problem'
import { Contest } from '@/types/contest';
import { SubmissionStatus } from '@/types/submission';

interface ContestTableProps {
  contests: Contest[];
  problemIndexes: string[];
  submissionStatusMap: Record<string, SubmissionStatus>;
}

export default function ContestTable({ contests, problemIndexes, submissionStatusMap }: ContestTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const contestType = searchParams.get('contestType') || 'abc';
  const sortOrder = searchParams.get('order') || 'desc';

  const handleValueChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const cellBackGroundColor = (problemId: string, startEpochSecond: number, durationSecond: number) => {
    const submission = submissionStatusMap[problemId];
    if (!submission || !submission.result || submission.epochSecond === undefined) {
      return '';
    }
    if (submission.result === 'AC') {
      if (startEpochSecond <= submission.epochSecond && submission.epochSecond < startEpochSecond + durationSecond) {
        return 'bg-green-200';
      }
      return 'bg-green-100';
    }
    return 'bg-yellow-100';
  }

  const getContestName = () => {
    switch (contestType) {
      case 'abc':
        return "Beginner";
      case 'arc':
        return "Regular";
      case 'agc':
        return "Grand";
      default:
        return "";
    }
  }
  
  return (
    <div className="flex-grow">
    <TooltipProvider>
      <Card className="flex min-h-screen border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <div className="flex space-x-4">
            <CardTitle className="text-lg text-slate-900">
              AtCoder {getContestName()} Contest
            </CardTitle>
            <Select
              value={contestType}
              onValueChange={(value) => handleValueChange('contestType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a contest" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Contests</SelectLabel>
                  <SelectItem value="abc">ABC</SelectItem>
                  <SelectItem value="arc">ARC</SelectItem>
                  <SelectItem value="agc">AGC</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value) => handleValueChange('order', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select by..." />
              </SelectTrigger>
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
                  {problemIndexes.map(problemIndex => <TableHead key={problemIndex} className="w-28 text-center border-l">{problemIndex}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-x-auto">
                {contests.map((contest) => (
                  <TableRow key={contest.id} className="hover:bg-slate-50">
                    <TableCell className="text-center">
                      <Link
                        href={`https://atcoder.jp/contests/${contest.id}`}
                        target="_blank"
                        className="font-medium text-slate-900 hover:underline">{contest.id.toUpperCase()}
                      </Link>
                    </TableCell>
                    {problemIndexes.map((problemIndex) => {
                      let problem: Problem | null = null;
                      let index: string | null = null
                      for (const key of problemIndex.split("/")) {
                        const p = contest.problems[key];
                        if (p) {
                          problem = p;
                          index = key;
                        }
                      }
                      return (
                        <TableCell key={problemIndex} className={`text-left border-l ${problem ? cellBackGroundColor(problem.id, contest.startEpochSecond, contest.durationSecond) : ''}`}>
                          {problem ? (
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <Link 
                                  href={`https://atcoder.jp/contests/${contest.id}/tasks/${problem.id}`}
                                  target="_blank">
                                  <div className="w-full">
                                    <div className={`font-medium fade-out-text ${getDifficultyColor(problem.difficulty)}`}>
                                      {`${index} - ${problem.name}`}
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
        </CardContent>
      </Card>
    </TooltipProvider>
    </div>
  );
}
