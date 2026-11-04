/**
 * Tag names that differ only in letter case are the same tag
 * (issue #133). Keep the first spelling the user used.
 */
export function dedupeTagNamesByCase(tagNames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of tagNames) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}
