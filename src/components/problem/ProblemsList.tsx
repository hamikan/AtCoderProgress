'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, XCircle, Eye, ExternalLink, BookOpen } from 'lucide-react';
import type { ProblemListItem } from '@/types/problem';
import { getDifficultyColor } from '@/lib/utils';
import { SolutionStatus } from '@prisma/client';

interface ProblemsListProps {
  items: ProblemListItem[];
  totalCount?: number;
}

const getStatusIcon = (status: SolutionStatus) => {
  switch (status) {
    case 'SELF_AC':
    case 'REVIEW_AC':
    case 'AC':
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case 'EXPLANATION_AC':
      return <Eye className="h-4 w-4 text-blue-600" />;
    case 'TRYING':
      return <Clock className="h-4 w-4 text-amber-600" />;
    default:
      return <XCircle className="h-4 w-4 text-slate-300" />;
  }
};

const getStatusLabel = (status: SolutionStatus) => {
  switch (status) {
    case 'AC': return 'AC';
    case 'SELF_AC': return '自力AC';
    case 'EXPLANATION_AC': return '解説AC';
    case 'REVIEW_AC': return '復習AC';
    case 'TRYING': return '挑戦中';
    default: return '未挑戦';
  }
};

const getStatusColor = (status: SolutionStatus) => {
  switch (status) {
    case 'AC':
    case 'SELF_AC': return 'bg-emerald-100 text-emerald-700';
    case 'EXPLANATION_AC': return 'bg-blue-100 text-blue-700';
    case 'REVIEW_AC': return 'bg-purple-100 text-purple-700';
    case 'TRYING': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default function ProblemsList({ items, totalCount }: ProblemsListProps) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          問題一覧{typeof totalCount === 'number' ? ` (${totalCount}件)` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16 text-center">状態</TableHead>
                <TableHead>問題名</TableHead>
                <TableHead className="w-24 text-center">難易度</TableHead>
                <TableHead className="w-32 text-center">ステータス</TableHead>
                <TableHead className="w-48">タグ</TableHead>
                <TableHead className="w-24 text-center">解答数</TableHead>
                <TableHead className="w-32 text-right">リンク</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((problem) => {
                const status = problem.status ?? 'UNSOLVED';
                const tags = problem.tags ?? [];
                return (
                  <TableRow key={problem.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getStatusIcon(status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`https://atcoder.jp/contests/${problem.contestId}/tasks/${problem.id}`} 
                        target="_blank" 
                        className="font-medium text-slate-900 hover:underline inline-flex items-center group"
                      >
                        <span className="text-slate-500 mr-2">{problem.contestId.toUpperCase()}-{problem.problemIndex}</span>
                        {problem.name}
                        <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty ?? '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-xs ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-600">
                        {typeof problem.totalSolutionCount === 'number'
                          ? problem.totalSolutionCount.toLocaleString()
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" asChild>
                          <Link href={`https://atcoder.jp/contests/${problem.contestId}/tasks/${problem.id}`} target="_blank" title="AtCoderで開く">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" asChild>
                          <Link href={`/solutions/new?problemId=${problem.id}`} title="解法を記録する">
                            <BookOpen className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
