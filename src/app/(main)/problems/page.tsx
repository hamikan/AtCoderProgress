'use client';

import { useState } from 'react';
import ProblemsFilters from '@/components/problems/ProblemsFilters';
import ContestTable from '@/components/problems/ContestTable';
import ProblemStats from '@/components/problems/ProblemStats';

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficultyRange, setDifficultyRange] = useState([0, 3000]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [contestTypeFilter, setContestTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('difficulty');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          difficultyRange={difficultyRange}
          statusFilter={statusFilter}
          contestTypeFilter={contestTypeFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </main>
    </div>
  );
}