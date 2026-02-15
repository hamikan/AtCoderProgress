'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Edit, 
  ExternalLink, 
} from 'lucide-react';
import { getDifficultyColor } from '@/lib/utils';

interface SolutionsListProps {
  searchQuery: string;
  selectedTags: string[];
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onEditSolution: (solution: any) => void;
}

interface Solution {
  id: string;
  problemId: string;
  problemTitle: string;
  contest: string;
  difficulty: number;
  status: '自力AC' | '解説AC' | '挑戦中' | '本番未AC';
  algorithmTags: string[];
  contentTags: string[];
  solvedDate: string;
  priority: 'high' | 'medium' | 'low';
  hasCode: boolean;
  hasMemo: boolean;
  summary: string;
}

export default function SolutionsList({
  searchQuery,
  selectedTags,
  statusFilter,
  sortBy,
  sortOrder,
  onEditSolution,
}: SolutionsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample solutions data
  const solutions: Solution[] = [
    {
      id: '1',
      problemId: 'abc301_d',
      problemTitle: 'ABC 301 D - Bitmask',
      contest: 'AtCoder Beginner Contest 301',
      difficulty: 1200,
      status: '自力AC',
      algorithmTags: ['ビット演算', '全探索'],
      contentTags: ['数学'],
      solvedDate: '2024-01-15',
      priority: 'medium',
      hasCode: true,
      hasMemo: true,
      summary: 'ビット演算を使った全探索で解決。状態の管理に工夫が必要だった。',
    },
    {
      id: '2',
      problemId: 'abc300_e',
      problemTitle: 'ABC 300 E - Dice Product 3',
      contest: 'AtCoder Beginner Contest 300',
      difficulty: 1400,
      status: '解説AC',
      algorithmTags: ['確率', 'DP'],
      contentTags: ['数学'],
      solvedDate: '2024-01-14',
      priority: 'high',
      hasCode: true,
      hasMemo: true,
      summary: '確率DPの考え方が理解できていなかった。期待値の計算方法を復習が必要。',
    },
    {
      id: '3',
      problemId: 'abc299_f',
      problemTitle: 'ABC 299 F - Square Subsequence',
      contest: 'AtCoder Beginner Contest 299',
      difficulty: 1600,
      status: '挑戦中',
      algorithmTags: ['文字列', 'DP'],
      contentTags: ['文字列処理'],
      solvedDate: '2024-01-13',
      priority: 'high',
      hasCode: false,
      hasMemo: true,
      summary: '文字列DPの応用問題。まだ完全に理解できていない。',
    },
    {
      id: '4',
      problemId: 'abc298_c',
      problemTitle: 'ABC 298 C - Cards Query Problem',
      contest: 'AtCoder Beginner Contest 298',
      difficulty: 1100,
      status: '自力AC',
      algorithmTags: ['データ構造', 'map'],
      contentTags: ['実装'],
      solvedDate: '2024-01-12',
      priority: 'low',
      hasCode: true,
      hasMemo: false,
      summary: 'mapを使ったクエリ処理。実装は簡単だった。',
    },
    {
      id: '5',
      problemId: 'abc297_d',
      problemTitle: 'ABC 297 D - Count Subtractions',
      contest: 'AtCoder Beginner Contest 297',
      difficulty: 1300,
      status: '本番未AC',
      algorithmTags: ['数学', 'ユークリッド互除法'],
      contentTags: ['数学'],
      solvedDate: '2024-01-11',
      priority: 'high',
      hasCode: true,
      hasMemo: true,
      summary: 'コンテスト中に時間が足りなかった。ユークリッド互除法の応用。',
    },
  ];

  // Filter solutions
  const filteredSolutions = solutions.filter(solution => {
    // Search filter
    if (searchQuery && !solution.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !solution.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && solution.status !== statusFilter) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0) {
      const allTags = [...solution.algorithmTags, ...solution.contentTags];
      if (!selectedTags.some(tag => allTags.includes(tag))) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.solvedDate).getTime() - new Date(b.solvedDate).getTime();
        break;
      case 'difficulty':
        comparison = a.difficulty - b.difficulty;
        break;
      case 'problem':
        comparison = a.problemTitle.localeCompare(b.problemTitle);
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(filteredSolutions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSolutions = filteredSolutions.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '自力AC':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case '解説AC':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case '挑戦中':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case '本番未AC':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '自力AC':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '解説AC':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '挑戦中':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case '本番未AC':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          解法記録 ({filteredSolutions.length}件)
        </h2>
        <div className="text-sm text-slate-600">
          {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSolutions.length)} / {filteredSolutions.length}
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="grid gap-6">
        {paginatedSolutions.map((solution) => (
          <Card key={solution.id} className="border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(solution.status)}
                    <Badge className={`text-xs ${getStatusColor(solution.status)}`}>
                      {solution.status}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(solution.priority)}`}>
                      優先度: {solution.priority === 'high' ? '高' : solution.priority === 'medium' ? '中' : '低'}
                    </Badge>
                    <span className={`text-sm font-medium ${getDifficultyColor(solution.difficulty)}`}>
                      {solution.difficulty}
                    </span>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {solution.problemTitle}
                  </CardTitle>
                  
                  <p className="text-sm text-slate-600">{solution.contest}</p>
                  <p className="text-sm text-slate-500">回答日: {solution.solvedDate}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSolution(solution)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    編集
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    問題
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Summary */}
              <p className="text-sm text-slate-700">{solution.summary}</p>
              
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-slate-600 mr-2">アルゴリズム:</span>
                  {solution.algorithmTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-slate-600 mr-2">内容:</span>
                  {solution.contentTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-4">
                  {solution.hasCode && (
                    <span className="flex items-center text-emerald-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      コード記録済み
                    </span>
                  )}
                  {solution.hasMemo && (
                    <span className="flex items-center text-blue-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      メモ記録済み
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {filteredSolutions.length}件中 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSolutions.length)}件を表示
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
  );
}