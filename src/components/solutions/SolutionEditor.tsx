'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  Save,
  Sparkles,
  CheckCircle2,
  Tag as TagIcon,
  X,
  Clock,
  Database,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { SolutionStatus } from '@prisma/client';
import type { SolutionWithTags } from '@/lib/services/db/solution';
import type { AvailableTag } from '@/lib/services/db/tag';
import { getDifficultyColor } from '@/lib/utils';

// Plate.js Core & Plugins
import { Plate, usePlateEditor } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { EditorKit } from '@/components/editor/editor-kit';

// Math CSS
import "katex/dist/katex.min.css";

interface SolutionEditorProps {
  problem: {
    id: string;
    name: string;
    difficulty: number | null;
    firstContest: { id: string };
  };
  initialSolution: SolutionWithTags | null;
  availableTags: AvailableTag[];
}

export default function SolutionEditor({ problem, initialSolution, availableTags }: SolutionEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<SolutionStatus>(initialSolution?.status || 'AC');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSolution?.userTags.map(t => t.userTag.name) || []
  );
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Plate Editor
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialSolution?.content
      ? JSON.parse(initialSolution.content)
      : [{ type: 'p', children: [{ text: '' }] }]
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const content = JSON.stringify(editor.children);
      // TODO: Implement actual save action
      console.log('Saving Data:', { status, tags: selectedTags, content });
      alert('解法を保存しました（モック動作）');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const difficultyColorClass = getDifficultyColor(problem.difficulty);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#0f172a] font-sans antialiased flex flex-col items-center selection:bg-slate-200 selection:text-slate-900">
      <div className="w-full max-w-[1600px] h-screen flex flex-col p-4 md:p-6 gap-6">

        {/* Navigation */}

        <div className="flex-1 flex gap-8 min-h-0">
          {/* SIDEBAR: Notion-like */}
          <aside className="w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pb-4 pr-2 custom-scrollbar text-left text-primary">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold tracking-wide uppercase">
                  {problem.firstContest.id}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-orange-200 bg-orange-50/50">
                  <span className={`text-[10px] font-bold ${difficultyColorClass} uppercase tracking-wider`}>
                    Diff: {problem.difficulty ?? '???'}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {problem.name}
              </h1>
            </div>

            {/* Status Card with Gradient Accent */}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden relative group hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400"></div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Current Status</Label>
                  <div className="relative">
                    <Select value={status} onValueChange={(v) => setStatus(v as SolutionStatus)}>
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl py-2.5 pl-9 pr-10 focus:ring-2 focus:ring-slate-200 transition-all font-medium text-sm text-slate-900 shadow-none border-none h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="AC" className="text-emerald-600 font-semibold">Accepted (AC)</SelectItem>
                        <SelectItem value="SELF_AC" className="text-amber-600 font-semibold">Self AC</SelectItem>
                        <SelectItem value="EXPLANATION_AC" className="text-blue-600 font-semibold">Editorial AC</SelectItem>
                        <SelectItem value="REVIEW_AC" className="text-purple-600 font-semibold">Reviewing</SelectItem>
                        <SelectItem value="TRYING" className="text-slate-600 font-semibold">Trying</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none">
                      <CheckCircle2 className="h-4 w-4 fill-current opacity-80" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-slate-200 transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 h-auto"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Solution'}</span>
                </Button>
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.02)] border border-gray-100 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Tags</h3>
                <span className="text-xs text-slate-400">{selectedTags.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedTags.includes(tag.name)
                        ? 'bg-slate-100 text-slate-800 border-slate-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                      } group`}
                  >
                    <span>{tag.name}</span>
                    {selectedTags.includes(tag.name) && <X className="h-3 w-3 opacity-60 group-hover:opacity-100 ml-1" />}
                  </button>
                ))}
                <div className="relative w-full mt-2 group">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Add tag..."
                    className="w-full bg-slate-50 border-none rounded-lg py-1.5 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:ring-0 text-slate-700 hover:bg-slate-100 transition-colors shadow-none h-auto"
                  />
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 bg-white rounded-[1.5rem] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.025)] border border-slate-200 overflow-hidden">
            {!mounted ? (
              <div className="min-h-[800px] bg-slate-50 animate-pulse rounded-xl mt-8" />
            ) : (
              <Plate editor={editor}>
                <EditorContainer>
                  <Editor />
                </EditorContainer>
              </Plate>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
