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

interface ContestTableProps {
  searchQuery: string;
  selectedTags: string[];
  difficultyRange: number[];
  statusFilter: string;
  contestTypeFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

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

export default function ContestTable({
  searchQuery,
  selectedTags,
  difficultyRange,
  statusFilter,
  contestTypeFilter,
  sortBy,
  sortOrder,
}: ContestTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sample contest data
  const contests: Contest[] = [
    {
      id: 'abc414',
      name: 'AtCoder Beginner Contest 414',
      type: 'ABC',
      number: 414,
      date: '2024-07-27',
      problems: {
        A: {
          id: 'abc414_a',
          title: 'Gluttonous Takahashi',
          difficulty: 100,
          status: 'ac',
          tags: ['実装'],
          url: 'https://atcoder.jp/contests/abc414/tasks/abc414_a',
          acRate: 95.2,
        },
        B: {
          id: 'abc414_b',
          title: 'Roulette',
          difficulty: 200,
          status: 'ac',
          tags: ['実装', '数学'],
          url: 'https://atcoder.jp/contests/abc414/tasks/abc414_b',
          acRate: 87.5,
        },
        C: {
          id: 'abc414_c',
          title: 'Reorder',
          difficulty: 400,
          status: 'explanation',
          tags: ['ソート', '実装'],
          url: 'https://atcoder.jp/contests/abc414/tasks/abc414_c',
          acRate: 72.1,
        },
        D: {
          id: 'abc414_d',
          title: 'Bitmask',
          difficulty: 1200,
          status: 'unsolved',
          tags: ['ビット演算', '全探索'],
          url: 'https://atcoder.jp/contests/abc414/tasks/abc414_d',
          acRate: 45.8,
        },
        E: {
          id: 'abc414_e',
          title: 'Routing',
          difficulty: 1600,
          status: 'unsolved',
          tags: ['グラフ', 'BFS'],
          url: 'https://atcoder.jp/contests/abc414/tasks/abc414_e',
          acRate: 28.3,
        },
        F: null,
        G: null,
      },
    },
    {
      id: 'abc413',
      name: 'AtCoder Beginner Contest 413',
      type: 'ABC',
      number: 413,
      date: '2024-07-20',
      problems: {
        A: {
          id: 'abc413_a',
          title: 'Leyland Number',
          difficulty: 100,
          status: 'ac',
          tags: ['実装', '数学'],
          url: 'https://atcoder.jp/contests/abc413/tasks/abc413_a',
          acRate: 92.7,
        },
        B: {
          id: 'abc413_b',
          title: 'Minimize Abs 1',
          difficulty: 300,
          status: 'ac',
          tags: ['実装'],
          url: 'https://atcoder.jp/contests/abc413/tasks/abc413_b',
          acRate: 81.4,
        },
        C: {
          id: 'abc413_c',
          title: 'Minimize Abs 2',
          difficulty: 600,
          status: 'trying',
          tags: ['二分探索', '実装'],
          url: 'https://atcoder.jp/contests/abc413/tasks/abc413_c',
          acRate: 65.9,
        },
        D: {
          id: 'abc413_d',
          title: 'Takahashi Quest',
          difficulty: 1400,
          status: 'explanation',
          tags: ['DP', 'データ構造'],
          url: 'https://atcoder.jp/contests/abc413/tasks/abc413_d',
          acRate: 38.2,
        },
        E: {
          id: 'abc413_e',
          title: 'Rearrange',
          difficulty: 1800,
          status: 'unsolved',
          tags: ['DP', '組み合わせ'],
          url: 'https://atcoder.jp/contests/abc413/tasks/abc413_e',
          acRate: 15.7,
        },
        F: {
          id: 'abc413_f',
          title: 'Rook on Grid',
          difficulty: 2200,
          status: 'unsolved',
          tags: ['グラフ', 'データ構造'],
          url: 'https://atcoder.jp/contests/abc413/tasks/abc413_f',
          acRate: 8.3,
        },
        G: null,
      },
    },
    {
      id: 'arc201',
      name: 'AtCoder Regular Contest 201',
      type: 'ARC',
      number: 201,
      date: '2024-07-14',
      problems: {
        A: {
          id: 'arc201_a',
          title: 'Construct Permutation',
          difficulty: 800,
          status: 'ac',
          tags: ['構築', '実装'],
          url: 'https://atcoder.jp/contests/arc201/tasks/arc201_a',
          acRate: 68.5,
        },
        B: {
          id: 'arc201_b',
          title: 'Interval Game',
          difficulty: 1400,
          status: 'explanation',
          tags: ['ゲーム理論', '貪欲法'],
          url: 'https://atcoder.jp/contests/arc201/tasks/arc201_b',
          acRate: 42.1,
        },
        C: {
          id: 'arc201_c',
          title: 'Maximize GCD',
          difficulty: 2000,
          status: 'unsolved',
          tags: ['数学', 'DP'],
          url: 'https://atcoder.jp/contests/arc201/tasks/arc201_c',
          acRate: 18.9,
        },
        D: {
          id: 'arc201_d',
          title: 'Tree Coloring',
          difficulty: 2400,
          status: 'unsolved',
          tags: ['グラフ', 'DP'],
          url: 'https://atcoder.jp/contests/arc201/tasks/arc201_d',
          acRate: 7.2,
        },
        E: {
          id: 'arc201_e',
          title: 'Polynomial Query',
          difficulty: 2800,
          status: 'unsolved',
          tags: ['数学', 'データ構造'],
          url: 'https://atcoder.jp/contests/arc201/tasks/arc201_e',
          acRate: 2.1,
        },
        F: {
          id: 'arc201_f',
          title: 'Matrix Operations',
          difficulty: 3200,
          status: 'unsolved',
          tags: ['数学', '線形代数'],
          url: 'https://atcoder.jp/contests/arc201/tasks/arc201_f',
          acRate: 0.8,
        },
        G: null,
      },
    },
    {
      id: 'abc412',
      name: 'AtCoder Beginner Contest 412',
      type: 'ABC',
      number: 412,
      date: '2024-07-13',
      problems: {
        A: {
          id: 'abc412_a',
          title: 'Gluttonous Takahashi',
          difficulty: 100,
          status: 'ac',
          tags: ['実装'],
          url: 'https://atcoder.jp/contests/abc412/tasks/abc412_a',
          acRate: 94.1,
        },
        B: {
          id: 'abc412_b',
          title: 'Typing',
          difficulty: 200,
          status: 'ac',
          tags: ['実装', '文字列'],
          url: 'https://atcoder.jp/contests/abc412/tasks/abc412_b',
          acRate: 89.3,
        },
        C: {
          id: 'abc412_c',
          title: 'Inversion',
          difficulty: 500,
          status: 'ac',
          tags: ['実装', '貪欲法'],
          url: 'https://atcoder.jp/contests/abc412/tasks/abc412_c',
          acRate: 76.8,
        },
        D: {
          id: 'abc412_d',
          title: 'Divide and Conquer',
          difficulty: 1100,
          status: 'trying',
          tags: ['DP', '数学'],
          url: 'https://atcoder.jp/contests/abc412/tasks/abc412_d',
          acRate: 52.4,
        },
        E: {
          id: 'abc412_e',
          title: 'Rearrange Query',
          difficulty: 1500,
          status: 'unsolved',
          tags: ['データ構造', 'セグメント木'],
          url: 'https://atcoder.jp/contests/abc412/tasks/abc412_e',
          acRate: 31.7,
        },
        F: {
          id: 'abc412_f',
          title: 'Subsequence LCM',
          difficulty: 1900,
          status: 'unsolved',
          tags: ['DP', '数学'],
          url: 'https://atcoder.jp/contests/abc412/tasks/abc412_f',
          acRate: 12.5,
        },
        G: null,
      },
    },
    {
      id: 'agc068',
      name: 'AtCoder Grand Contest 068',
      type: 'AGC',
      number: 68,
      date: '2024-07-07',
      problems: {
        A: {
          id: 'agc068_a',
          title: 'Permutation and Queries',
          difficulty: 1600,
          status: 'explanation',
          tags: ['データ構造', '実装'],
          url: 'https://atcoder.jp/contests/agc068/tasks/agc068_a',
          acRate: 35.2,
        },
        B: {
          id: 'agc068_b',
          title: 'Substring Queries',
          difficulty: 2200,
          status: 'unsolved',
          tags: ['文字列', 'DP'],
          url: 'https://atcoder.jp/contests/agc068/tasks/agc068_b',
          acRate: 12.8,
        },
        C: {
          id: 'agc068_c',
          title: 'Tree Reconstruction',
          difficulty: 2800,
          status: 'unsolved',
          tags: ['グラフ', '構築'],
          url: 'https://atcoder.jp/contests/agc068/tasks/agc068_c',
          acRate: 3.4,
        },
        D: {
          id: 'agc068_d',
          title: 'Game on Tree',
          difficulty: 3400,
          status: 'unsolved',
          tags: ['ゲーム理論', 'グラフ'],
          url: 'https://atcoder.jp/contests/agc068/tasks/agc068_d',
          acRate: 0.9,
        },
        E: {
          id: 'agc068_e',
          title: 'Matrix Determinant',
          difficulty: 3600,
          status: 'unsolved',
          tags: ['数学', '線形代数'],
          url: 'https://atcoder.jp/contests/agc068/tasks/agc068_e',
          acRate: 0.3,
        },
        F: {
          id: 'agc068_f',
          title: 'Polynomial Evaluation',
          difficulty: 3800,
          status: 'unsolved',
          tags: ['数学', 'FFT'],
          url: 'https://atcoder.jp/contests/agc068/tasks/agc068_f',
          acRate: 0.1,
        },
        G: null,
      },
    },
  ];

  // Filter contests
  const filteredContests = contests.filter(contest => {
    // Contest type filter
    if (contestTypeFilter !== 'all' && contest.type !== contestTypeFilter) {
      return false;
    }

    // Search filter
    if (searchQuery && !contest.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Check if any problem in the contest matches the filters
    const hasMatchingProblem = Object.values(contest.problems).some(problem => {
      if (!problem) return false;

      // Difficulty filter
      if (problem.difficulty < difficultyRange[0] || problem.difficulty > difficultyRange[1]) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && problem.status !== statusFilter) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => problem.tags.includes(tag))) {
        return false;
      }

      return true;
    });

    return hasMatchingProblem;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'contest_id':
        comparison = a.number - b.number;
        break;
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(filteredContests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContests = filteredContests.slice(startIndex, startIndex + itemsPerPage);

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