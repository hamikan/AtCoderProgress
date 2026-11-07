'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SelectableTag } from '@/features/problems/types';

interface SolutionTagSelectorProps {
  availableTags: SelectableTag[];
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
    const tagKey = toTagKey(normalizedTagName);
    if (selectedTagKeys.has(tagKey)) {
      setTagSearch('');
      return;
    }

    const existingTagName = allTagNames.find((name) => toTagKey(name) === tagKey);
    onSelectedTagsChange([...selectedTags, existingTagName ?? normalizedTagName]);
    setTagSearch('');
  };

  const removeTag = (tagName: string) => {
    const tagKey = toTagKey(tagName);
    onSelectedTagsChange(selectedTags.filter((tag) => toTagKey(tag) !== tagKey));
  };

  const canCreateTag = normalizedSearch.length > 0 && !selectedTagKeys.has(toTagKey(normalizedSearch));

  return (
    <div className="space-y-1.5">
      <Label htmlFor="solution-tag-search" className="text-xs font-medium text-slate-500">
        タグ
      </Label>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => removeTag(tagName)}
              aria-label={`${tagName} を外す`}
              className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <span>{tagName}</span>
              <X className="size-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="solution-tag-search"
          placeholder="タグを探す・作る"
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
          variant="ghost"
          aria-label="入力中の名前でタグを追加"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:text-slate-300"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {normalizedSearch && matchingTags.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1">
          {matchingTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => addTag(tagName)}
              className="w-full rounded-md px-3 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              {tagName}
            </button>
          ))}
        </div>
      )}

      {normalizedSearch && matchingTags.length === 0 && (
        <p className="text-xs text-slate-400">
          一致するタグがありません。Enter か + で新しく作れます。
        </p>
      )}

    </div>
  );
}
