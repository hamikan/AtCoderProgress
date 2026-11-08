import type { SelectableTag } from '@/features/problems/types';

type TagChoice = Pick<SelectableTag, 'name' | 'usageCount'>;

export function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function toTagKey(value: string): string {
  return value.toLocaleLowerCase();
}

export function rankTagsByUsage(tags: readonly TagChoice[]): Map<string, number> {
  const sorted = [...tags].sort(
    (a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name)
  );
  const ranking = new Map<string, number>();
  for (const tag of sorted) {
    const key = toTagKey(tag.name);
    if (!ranking.has(key)) {
      ranking.set(key, ranking.size);
    }
  }
  return ranking;
}

export function listTagsToAdd(
  tags: readonly TagChoice[],
  selectedTags: readonly string[],
  ranking: ReadonlyMap<string, number>,
  search: string
): string[] {
  const hiddenKeys = new Set(selectedTags.map((tag) => toTagKey(tag)));
  const searchKey = toTagKey(normalizeTagName(search));
  const names: string[] = [];
  for (const tag of tags) {
    const key = toTagKey(tag.name);
    if (hiddenKeys.has(key) || !key.includes(searchKey)) {
      continue;
    }
    hiddenKeys.add(key);
    names.push(tag.name);
  }
  // 開いたあとに作ったタグは順位がないので、目に入るよう先頭に置く
  const rankOf = (name: string) => ranking.get(toTagKey(name)) ?? -1;
  return names.sort((a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b));
}

export function findExistingTagName(
  tags: readonly TagChoice[],
  selectedTags: readonly string[],
  name: string
): string | null {
  const key = toTagKey(normalizeTagName(name));
  const names = [...selectedTags, ...tags.map((tag) => tag.name)];
  return names.find((existing) => toTagKey(existing) === key) ?? null;
}

export function findTagToCreate(
  tags: readonly TagChoice[],
  selectedTags: readonly string[],
  search: string
): string | null {
  const name = normalizeTagName(search);
  if (!name || findExistingTagName(tags, selectedTags, name)) {
    return null;
  }
  return name;
}
