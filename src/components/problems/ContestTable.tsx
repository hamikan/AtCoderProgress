'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, Clock, XCircle, ExternalLink, Star, Eye, BookOpen } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: number;
  status: 'ac' | 'explanation' | 'trying' | 'unsolved';
  tags: string[];
  url: string;
  acRate: number;
}

interface Contest {
  id: string;
  name: string;
  type: 'ABC' | 'ARC' | 'AGC' | 'AHC' | 'Other';
  number: number;
  date: string;
  problems: { [key: string]: Problem | null }; // A, B, C, D, E, F, G
}

interface ContestTableProps {
  contests: Contest[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function ContestTable({
  contests,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  setCurrentPage,
}: ContestTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContests = contests; // ページネーションは親コンポーネントで処理済み

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ac':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'explanation':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'trying':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <XCircle className="h-4 w-4 text-slate-300" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 400) return 'text-gray-600';
    if (difficulty < 800) return 'text-amber-600';
    if (difficulty < 1200) return 'text-emerald-600';
    if (difficulty < 1600) return 'text-blue-600';
    if (difficulty < 2000) return 'text-purple-600';
    if (difficulty < 2400) return 'text-red-600';
    return 'text-red-800';
  };

  const problemLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <TooltipProvider>
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              コンテスト一覧 ({filteredContests.length}件)
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredContests.length)} / {filteredContests.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-48">コンテスト</TableHead>
                    <TableHead className="w-16 text-center">A</TableHead>
                    <TableHead className="w-16 text-center">B</TableHead>
                    <TableHead className="w-16 text-center">C</TableHead>
                    <TableHead className="w-16 text-center">D</TableHead>
                    <TableHead className="w-16 text-center">E</TableHead>
                    <TableHead className="w-16 text-center">F</TableHead>
                    <TableHead className="w-16 text-center">G</TableHead>
                    <TableHead className="w-32">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContests.map((contest) => (
                    <TableRow key={contest.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-900">{contest.name}</div>
                          <div className="text-xs text-slate-500">{contest.date}</div>
                          <Badge variant="outline" className="text-xs">
                            {contest.type}
                          </Badge>
                        </div>
                      </TableCell>
                      {problemLetters.map((letter) => {
                        const problem = contest.problems[letter];
                        return (
                          <TableCell key={letter} className="text-center">
                            {problem ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 relative"
                                    onClick={() => window.open(problem.url, '_blank')}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      {getStatusIcon(problem.status)}
                                    </div>
                                    <span className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                      {letter}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">{problem.title}</div>
                                    <div className="text-xs">難易度: {problem.difficulty}</div>
                                    <div className="text-xs">AC率: {problem.acRate}%</div>
                                    <div className="flex flex-wrap gap-1">
                                      {problem.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(`https://atcoder.jp/contests/${contest.id}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Star className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <BookOpen className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {filteredContests.length}件中 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredContests.length)}件を表示
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-slate-400">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}