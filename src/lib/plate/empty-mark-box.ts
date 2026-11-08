type MarkedText = { readonly text: string } & Readonly<Record<string, unknown>>;
type Marks = Readonly<Record<string, unknown>>;

function toMarkEntries(marks: Marks): string {
  return JSON.stringify(
    Object.entries(marks)
      .filter(([key, value]) => key !== 'text' && value != null && value !== false)
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

export function findEmptyBoxMarks(
  leaf: MarkedText,
  pendingMarks: Marks | null,
  boxKeys: readonly string[]
): string[] {
  const marks = pendingMarks ?? leaf;
  const keys = boxKeys.filter((key) => Boolean(marks[key]));
  if (keys.length === 0) {
    return [];
  }
  // 打つ前の印は、今の文字と印が違うときだけ空の箱としてカーソルの位置に出る
  const isWaitingBox = pendingMarks !== null && toMarkEntries(pendingMarks) !== toMarkEntries(leaf);
  return leaf.text === '' || isWaitingBox ? keys : [];
}
