'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SolutionsList from '@/components/solutions/SolutionsList';
import SolutionsFilters from '@/components/solutions/SolutionsFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProblemSearchDialog from '@/components/solutions/dialogs/ProblemSearchDialog';

export default function SolutionsPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleNewSolution = () => {
    setIsSearchOpen(true);
  };

  const handleEditSolution = (solution: any) => {
    router.push(`/solutions/${solution.problemId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">解法記録</h1>
            <p className="text-slate-600">問題の解法とコードを記録・管理</p>
          </div>
          <Button 
            onClick={handleNewSolution}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新しい解法を記録
          </Button>
        </div>

        {/* Filters */}
        <SolutionsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Solutions List */}
        <SolutionsList
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          statusFilter={statusFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onEditSolution={handleEditSolution}
        />

        <ProblemSearchDialog 
          open={isSearchOpen} 
          onOpenChange={setIsSearchOpen} 
        />
      </main>
    </div>
  );
}