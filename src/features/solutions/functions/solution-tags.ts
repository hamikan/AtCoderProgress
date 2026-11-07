import type { SelectableTag } from '@/features/problems/types';

type TagChoice = Pick<SelectableTag, 'name' | 'usageCount'>;

export function normalizeTagName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function toTagKey(value: string): string {
  return value.toLocaleLowerCase();
}

export function buildTagChoices(
  availableTags: readonly TagChoice[],
  selectedTags: readonly string[]
): TagChoice[] {
  const choicesByKey = new Map<string, TagChoice>();
  for (const tag of availableTags) {
    choicesByKey.set(toTagKey(tag.name), { name: tag.name, usageCount: tag.usageCount });
  }
  // まだ保存していない新しいタグも、付けている間は選べるように並べる
  for (const tagName of selectedTags) {
    const key = toTagKey(tagName);
    if (!choicesByKey.has(key)) {
      choicesByKey.set(key, { name: tagName, usageCount: 0 });
    }
  }
  return [...choicesByKey.values()].sort(
    (a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name)
  );
}

export function filterTagChoices(
  choices: readonly TagChoice[],
  search: string
): TagChoice[] {
  const searchKey = toTagKey(normalizeTagName(search));
  if (!searchKey) {
    return [...choices];
  }
  return choices.filter((choice) => toTagKey(choice.name).includes(searchKey));
}

export function findTagToCreate(
  choices: readonly TagChoice[],
  search: string
): string | null {
  const name = normalizeTagName(search);
  if (!name) {
    return null;
  }
  const key = toTagKey(name);
  return choices.some((choice) => toTagKey(choice.name) === key) ? null : name;
}
