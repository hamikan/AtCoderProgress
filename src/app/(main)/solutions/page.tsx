'use client';

import { useState } from 'react';
import SolutionsList from '@/components/solutions/SolutionsList';
import SolutionEditor from '@/components/solutions/SolutionEditor';
import SolutionsFilters from '@/components/solutions/SolutionsFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SolutionsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [publicFilter, setPublicFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleNewSolution = () => {
    setEditingSolution(null);
    setIsEditorOpen(true);
  };

  const handleEditSolution = (solution: any) => {
    setEditingSolution(solution);
    setIsEditorOpen(true);
  };

  const handleCloseSolution = () => {
    setIsEditorOpen(false);
    setEditingSolution(null);
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
          publicFilter={publicFilter}
          setPublicFilter={setPublicFilter}
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
          publicFilter={publicFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onEditSolution={handleEditSolution}
        />

        {/* Solution Editor Modal */}
        {isEditorOpen && (
          <SolutionEditor
            solution={editingSolution}
            onClose={handleCloseSolution}
          />
        )}
      </main>
    </div>
  );
}