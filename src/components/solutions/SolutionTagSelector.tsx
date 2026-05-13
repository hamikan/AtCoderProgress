'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AvailableTag } from '@/lib/services/db/tag';

interface SolutionTagSelectorProps {
  availableTags: AvailableTag[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
}

function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function toTagKey(value: string): string {
  return value.toLocaleLowerCase();
}

export default function SolutionTagSelector({
  availableTags,
  selectedTags,
  onSelectedTagsChange,
}: SolutionTagSelectorProps) {
  const [tagSearch, setTagSearch] = useState('');
  const normalizedSearch = normalizeTagName(tagSearch);
  const selectedTagKeys = useMemo(
    () => new Set(selectedTags.map((tag) => toTagKey(tag))),
    [selectedTags]
  );

  const allTagNames = useMemo(() => {
    const tagNamesByKey = new Map<string, string>();

    for (const tag of availableTags) {
      tagNamesByKey.set(toTagKey(tag.name), tag.name);
    }

    for (const tagName of selectedTags) {
      tagNamesByKey.set(toTagKey(tagName), tagName);
    }

    return [...tagNamesByKey.values()].sort((a, b) => a.localeCompare(b));
  }, [availableTags, selectedTags]);

  const matchingTags = useMemo(() => {
    if (!normalizedSearch) return [];

    const searchKey = toTagKey(normalizedSearch);

    return allTagNames.filter((tagName) =>
      toTagKey(tagName).includes(searchKey) && !selectedTagKeys.has(toTagKey(tagName))
    );
  }, [allTagNames, normalizedSearch, selectedTagKeys]);

  const addTag = (tagName: string) => {
    const normalizedTagName = normalizeTagName(tagName);
    if (!normalizedTagName) return;
    if (selectedTagKeys.has(toTagKey(normalizedTagName))) {
      setTagSearch('');
      return;
    }

    onSelectedTagsChange([...selectedTags, normalizedTagName]);
    setTagSearch('');
  };

  const removeTag = (tagName: string) => {
    const tagKey = toTagKey(tagName);
    onSelectedTagsChange(selectedTags.filter((tag) => toTagKey(tag) !== tagKey));
  };

  const canCreateTag = normalizedSearch.length > 0 && !selectedTagKeys.has(toTagKey(normalizedSearch));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          タグ
        </Label>
        <span className="text-[10px] text-slate-400">{selectedTags.length} selected</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="タグを検索または作成"
          placeholder="タグを検索または作成..."
          value={tagSearch}
          onChange={(event) => setTagSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag(normalizedSearch);
            }
          }}
          className="pl-9 pr-10"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => addTag(normalizedSearch)}
          disabled={!canCreateTag}
          title="入力中の名前でタグを追加"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {normalizedSearch && matchingTags.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-1 shadow-sm">
          {matchingTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => addTag(tagName)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
            >
              {tagName}
            </button>
          ))}
        </div>
      )}

      {normalizedSearch && matchingTags.length === 0 && (
        <p className="px-1 text-xs text-slate-400">
          一致するタグがありません。+ で新しく追加できます。
        </p>
      )}

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => removeTag(tagName)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-800 transition-colors hover:bg-slate-300"
            >
              <span>{tagName}</span>
              <X className="size-3 opacity-60" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
