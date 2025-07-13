'use client';

import { useState } from 'react';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import AlgorithmRadar from '@/components/dashboard/AlgorithmRadar';
import RecommendedProblems from '@/components/dashboard/RecommendedProblems';
import RecentActivity from '@/components/dashboard/RecentActivity';
import WeaknessAnalysis from '@/components/dashboard/WeaknessAnalysis';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <StatsOverview />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            <RecommendedProblems />
            <ActivityHeatmap />
            <RecentActivity />
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            <AlgorithmRadar />
            <WeaknessAnalysis />
          </div>
        </div>
      </main>
    </div>
  );
}