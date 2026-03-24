'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  CheckCircle2,
  X,
  Plus,
  Search,
} from 'lucide-react';
import { SolutionStatus } from '@prisma/client';
import type { SolutionWithTags } from '@/lib/services/db/solution';
import type { AvailableTag } from '@/lib/services/db/tag';
import { getDifficultyColor } from '@/lib/utils';
import ProblemSearchDialog from '@/components/solutions/dialogs/ProblemSearchDialog';

// Plate.js Core & Plugins
import { Plate, usePlateEditor } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { EditorKit } from '@/components/editor/editor-kit';

// Math CSS
import "katex/dist/katex.min.css";

interface ProblemDetail {
  id: string;
  name: string;
  difficulty: number | null;
  firstContest: { id: string };
}

interface SolutionEditorProps {
  problem: ProblemDetail | null;
  initialSolution: SolutionWithTags | null;
  availableTags: AvailableTag[];
  onProblemSelected?: (problemId: string) => void;
}

export default function SolutionEditor({ problem, initialSolution, availableTags, onProblemSelected }: SolutionEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<SolutionStatus>(initialSolution?.status || 'AC');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSolution?.userTags.map(t => t.userTag.name) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      console.log('Saving Data:', { problemId: problem?.id, status, tags: selectedTags, content });
      alert('解法を保存しました（モック動作）');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-2 min-h-full">
            {!mounted ? (
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-slate-50 rounded w-full" />
                <div className="h-4 bg-slate-50 rounded w-5/6" />
                <div className="h-4 bg-slate-50 rounded w-4/6" />
              </div>
            ) : (
              <Plate editor={editor}>
                <EditorContainer className="border-none shadow-none p-0 min-h-0 max-w-full overflow-x-auto">
                  <Editor
                    variant="none"
                    className="p-0 text-slate-700 leading-relaxed text-base prose prose-slate max-w-none"
                  />
                </EditorContainer>
              </Plate>
            )}
          </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      <aside className="w-72 border-l border-slate-200 bg-slate-50/50 flex-shrink-0 overflow-y-auto hidden xl:flex flex-col gap-6">
        {/* Problem Header */}
        {problem ? (
          <div className="px-8 pt-8 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold tracking-wide uppercase">
                {problem.firstContest.id}
              </span>
              {problem.difficulty !== null && (
                <span className={`text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}>
                  Diff: {problem.difficulty}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight truncate">
              {problem.name}
            </h1>
          </div>
        ) : (
          <div className="px-8 pt-8 pb-4 border-b border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 border-dashed border-2 border-slate-300 hover:border-slate-400 px-6 py-3 rounded-xl h-auto"
            >
              <Search className="size-4" />
              <span className="font-medium">問題を選択...</span>
            </Button>
          </div>
        )}
        {/* Status */}
        <div className="space-y-1.5 text-left">
          <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ステータス</Label>
          <div className="relative">
            <Select value={status} onValueChange={(v) => setStatus(v as SolutionStatus)}>
              <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl py-2.5 pl-9 pr-10 focus:ring-2 focus:ring-slate-200 transition-all font-medium text-sm text-slate-900 shadow-none h-auto">
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

        {/* Tags */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">タグ</Label>
            <span className="text-[10px] text-slate-400">{selectedTags.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.name)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${selectedTags.includes(tag.name)
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                  } group`}
              >
                <span>{tag.name}</span>
                {selectedTags.includes(tag.name) && <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !problem}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-slate-200 transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 h-auto"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Solution'}</span>
        </Button>
      </aside>

      {/* Problem Search Dialog (for draft mode) */}
      <ProblemSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectProblem={onProblemSelected}
      />
    </div>
  );
}
