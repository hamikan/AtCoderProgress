'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { Plus, Search } from 'lucide-react';

import type { SelectableTag } from '@/features/problems/types';
import {
  findExistingTagName,
  findTagToCreate,
  listTagsToAdd,
  normalizeTagName,
  rankTagsByUsage,
  toTagKey,
} from '@/features/solutions/functions/solution-tags';
import { cn } from '@/lib/utils';

interface SolutionTagSelectorProps {
  availableTags: SelectableTag[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
}

const CHIP_CLASS_NAME =
  'inline-flex h-5.5 max-w-full items-center gap-1 rounded-md border px-2 text-xs transition-colors';

const TAG_CHIP_CLASS_NAME = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

export default function SolutionTagSelector({
  availableTags,
  selectedTags,
  onSelectedTagsChange,
}: SolutionTagSelectorProps) {
  // 保存のたびに使用回数が変わっても、開いている間は並びを動かさない
  const [ranking] = useState(() => rankTagsByUsage(availableTags));
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const tagsToAdd = listTagsToAdd(availableTags, selectedTags, ranking, search);
  const tagToCreate = findTagToCreate(availableTags, selectedTags, search);

  function addTag(tagName: string) {
    const key = toTagKey(tagName);
    if (!selectedTags.some((tag) => toTagKey(tag) === key)) {
      onSelectedTagsChange([...selectedTags, tagName]);
    }
  }

  function removeTag(tagName: string) {
    const key = toTagKey(tagName);
    onSelectedTagsChange(selectedTags.filter((tag) => toTagKey(tag) !== key));
  }

  // 探して付けたあとは、続けて次のタグを探せるように検索欄へ戻す
  function clearSearch() {
    setSearch('');
    searchRef.current?.focus();
  }

  function handlePick(tagName: string) {
    addTag(tagName);
    if (search) {
      clearSearch();
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 変換を確定する Enter でタグを作らないようにする
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    const name = normalizeTagName(search);
    if (!name) {
      return;
    }
    addTag(findExistingTagName(availableTags, selectedTags, name) ?? name);
    clearSearch();
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500">タグ</p>
      {selectedTags.length > 0 && (
        <div role="group" aria-label="付けたタグ" className="flex flex-wrap gap-1.5">
          {selectedTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => removeTag(tagName)}
              aria-label={`${tagName} を外す`}
              title="押すと外す"
              className={cn(CHIP_CLASS_NAME, TAG_CHIP_CLASS_NAME)}
            >
              <span className="truncate">{tagName}</span>
            </button>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          aria-label="タグを探す・作る"
          placeholder="タグを探す・作る"
          className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm outline-none transition-colors focus:border-slate-400"
        />
      </div>
      <div role="group" aria-label="タグの候補" className="flex flex-wrap gap-1.5 empty:hidden">
        {tagToCreate && (
          <button
            type="button"
            onClick={() => handlePick(tagToCreate)}
            className={cn(
              CHIP_CLASS_NAME,
              'border-dashed border-blue-400 text-blue-700 hover:bg-blue-50'
            )}
          >
            <Plus className="size-3 shrink-0" />
            <span className="truncate">「{tagToCreate}」を作る</span>
          </button>
        )}
        {tagsToAdd.map((tagName) => (
          <button
            key={tagName}
            type="button"
            onClick={() => handlePick(tagName)}
            className={cn(CHIP_CLASS_NAME, TAG_CHIP_CLASS_NAME)}
          >
            <span className="truncate">{tagName}</span>
          </button>
        ))}
      </div>
      {availableTags.length === 0 && selectedTags.length === 0 && !tagToCreate ? (
        <p className="text-xs text-slate-400">タグはまだありません。名前を打つと作れます。</p>
      ) : null}
    </div>
  );
}
