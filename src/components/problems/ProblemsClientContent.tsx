'use client';

import { useState, useMemo } from 'react';
import ProblemsFilters from '@/components/problems/ProblemsFilters';
import ContestTable from '@/components/problems/ContestTable';
import ProblemStats from '@/components/problems/ProblemStats';
import { ProblemFromPrisma } from '@/types/problem';

// ContestTable.tsx から Contest と Problem のインターフェースをコピー
interface Problem {
  id: string;
  title: string;
  difficulty: number;
  status: 'ac' | 'explanation' | 'trying' | 'unsolved'; // ユーザーの提出状況に応じて動的に決定される
  tags: string[]; // AtCoder Problems APIからは取得できないため、一旦空配列
  url: string;
  acRate: number; // AtCoder Problems APIからは取得できないため、一旦ダミー値
}

interface Contest {
  id: string;
  name: string;
  type: 'ABC' | 'ARC' | 'AGC' | 'AHC' | 'Other';
  number: number;
  date: string;
  problems: { [key: string]: Problem | null }; // A, B, C, D, E, F, G
}

interface ProblemsClientContentProps {
  problems: ProblemFromPrisma[];
}

export default function ProblemsClientContent({ problems: problemsFromDb }: ProblemsClientContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficultyRange, setDifficultyRange] = useState([0, 3000]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [contestTypeFilter, setContestTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('difficulty');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // problemsFromDb を Contest[] 形式に変換
  const contests: Contest[] = useMemo(() => {
    const contestMap = new Map<string, Contest>();

    problemsFromDb.forEach(p => {
      const contestId = p.contestId;
      if (!contestMap.has(contestId)) {
        // コンテスト名とタイプ、番号、日付を推測またはダミーで設定
        // 実際のコンテスト情報は別途APIから取得するか、Prismaスキーマに追加する必要がある
        const contestTypeMatch = contestId.match(/^(abc|arc|agc|ahc)(\d+)/i);
        const type: Contest['type'] = contestTypeMatch ? (contestTypeMatch[1].toUpperCase() as Contest['type']) : 'Other';
        const number = contestTypeMatch ? parseInt(contestTypeMatch[2], 10) : 0;
        const name = `AtCoder ${type} Contest ${number}`; // 仮の名前
        const date = '2024-01-01'; // 仮の日付

        contestMap.set(contestId, {
          id: contestId,
          name: name,
          type: type,
          number: number,
          date: date,
          problems: {},
        });
      }

      const contest = contestMap.get(contestId)!;
      const problemLetter = p.problemIndex.toUpperCase(); // 'A', 'B', 'C' など
      
      // ここでユーザーの提出状況（status）やAC率、タグを決定する必要があるが、
      // 現状はPrismaのProblemモデルには含まれていないため、ダミー値または空で設定
      contest.problems[problemLetter] = {
        id: p.id,
        title: p.name,
        difficulty: p.difficulty !== null ? p.difficulty : 0, // nullの場合は0などデフォルト値
        status: 'unsolved', // 仮のステータス
        tags: [], // 仮のタグ
        url: `https://atcoder.jp/contests/${p.contestId}/tasks/${p.id}`,
        acRate: 0, // 仮のAC率
      };
    });

    // コンテストを番号でソート（新しいものから）
    return Array.from(contestMap.values()).sort((a, b) => b.number - a.number);
  }, [problemsFromDb]);

  // ContestTable.tsx のフィルタリング、ソート、ページネーションロジックをここに移動
  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
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

        // Status filter (現状は全てunsolvedなので機能しないが、将来的に必要)
        if (statusFilter !== 'all' && problem.status !== statusFilter) {
          return false;
        }

        // Tags filter (現状は全て空配列なので機能しないが、将来的に必要)
        if (selectedTags.length > 0 && !selectedTags.some(tag => problem.tags.includes(tag))) {
          return false;
        }

        return true;
      });

      return hasMatchingProblem;
    }).sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'contest_id': // ContestTable.tsxではnumberでソートしていた
          comparison = a.number - b.number;
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        default:
          comparison = 0; // デフォルトのソート順
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [contests, contestTypeFilter, searchQuery, difficultyRange, statusFilter, selectedTags, sortBy, sortOrder]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredContests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContests = filteredContests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <ProblemStats />
        
        {/* Filters */}
        <ProblemsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          difficultyRange={difficultyRange}
          setDifficultyRange={setDifficultyRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          contestTypeFilter={contestTypeFilter}
          setContestTypeFilter={setContestTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        {/* Contest Table */}
        <ContestTable
          contests={paginatedContests} // 変換したデータを渡す
          searchQuery={searchQuery} // フィルタリングはここで完結するため、ContestTableには不要だが、Propsの型に合わせる
          selectedTags={selectedTags}
          difficultyRange={difficultyRange}
          statusFilter={statusFilter}
          contestTypeFilter={contestTypeFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          currentPage={currentPage} // ページネーション情報も渡す
          itemsPerPage={itemsPerPage}
          totalItems={filteredContests.length}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </main>
    </div>
  );
}
