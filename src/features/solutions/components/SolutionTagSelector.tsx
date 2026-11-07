'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Plus, Search, X } from 'lucide-react';

import type { SelectableTag } from '@/features/problems/types';
import {
  buildTagChoices,
  filterTagChoices,
  findTagToCreate,
  normalizeTagName,
  toTagKey,
} from '@/features/solutions/functions/solution-tags';
import { useInlineDisclosure } from '@/features/solutions/hooks/use-inline-disclosure';
import { cn } from '@/lib/utils';

interface SolutionTagSelectorProps {
  availableTags: SelectableTag[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
}

const CHIP_CLASS_NAME =
  'inline-flex h-5.5 max-w-full items-center gap-1 rounded-md border px-2 text-xs transition-colors';

export default function SolutionTagSelector({
  availableTags,
  selectedTags,
  onSelectedTagsChange,
}: SolutionTagSelectorProps) {
  const { isOpen, open, panelRef, toggleRef } = useInlineDisclosure();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedKeys = useMemo(
    () => new Set(selectedTags.map((tag) => toTagKey(tag))),
    [selectedTags]
  );
  const choices = useMemo(
    () => buildTagChoices(availableTags, selectedTags),
    [availableTags, selectedTags]
  );
  const shownChoices = filterTagChoices(choices, search);
  const tagToCreate = findTagToCreate(choices, search);

  function addTag(tagName: string) {
    if (!selectedKeys.has(toTagKey(tagName))) {
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

  function toggleTag(tagName: string) {
    if (selectedKeys.has(toTagKey(tagName))) {
      removeTag(tagName);
    } else {
      addTag(tagName);
    }
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
    const sameChoice = choices.find((choice) => toTagKey(choice.name) === toTagKey(name));
    addTag(sameChoice?.name ?? name);
    clearSearch();
  }

  function handleOpen() {
    setSearch('');
    open();
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500">タグ</p>
      {isOpen ? (
        <div ref={panelRef} className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="タグを探す・作る"
              placeholder="タグを探す・作る"
              className="h-8 w-full rounded-md border border-slate-200 pl-8 pr-2 text-sm outline-none transition-colors focus:border-slate-400"
            />
          </div>
          <div role="group" aria-label="タグの候補" className="mt-2 flex flex-wrap gap-1.5">
            {tagToCreate && (
              <button
                type="button"
                onClick={() => {
                  addTag(tagToCreate);
                  clearSearch();
                }}
                className={cn(
                  CHIP_CLASS_NAME,
                  'border-dashed border-blue-400 text-blue-700 hover:bg-blue-50'
                )}
              >
                <Plus className="size-3 shrink-0" />
                <span className="truncate">「{tagToCreate}」を作る</span>
              </button>
            )}
            {shownChoices.map((choice) => {
              const isSelected = selectedKeys.has(toTagKey(choice.name));
              return (
                <button
                  key={choice.name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleTag(choice.name)}
                  className={cn(
                    CHIP_CLASS_NAME,
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className="truncate">{choice.name}</span>
                </button>
              );
            })}
          </div>
          {choices.length === 0 && !tagToCreate && (
            <p className="mt-2 text-xs text-slate-400">
              タグはまだありません。名前を打つと作れます。
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => removeTag(tagName)}
              aria-label={`${tagName} を外す`}
              className={cn(
                CHIP_CLASS_NAME,
                'border-transparent bg-blue-50 font-medium text-blue-700 hover:bg-blue-100'
              )}
            >
              <span className="truncate">{tagName}</span>
              <X className="size-3 shrink-0 opacity-60" />
            </button>
          ))}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={false}
            aria-label="タグを付ける"
            title="タグを付ける"
            onClick={handleOpen}
            className={cn(
              CHIP_CLASS_NAME,
              'border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700'
            )}
          >
            <Plus className="size-3 shrink-0" />
            {selectedTags.length === 0 && 'タグを付ける'}
          </button>
        </div>
      )}
    </div>
  );
}
