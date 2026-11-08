import type { SlateEditor, TRange } from 'platejs';

type MarkRun = { readonly start: number; readonly end: number };

function isText(node: unknown): node is { readonly text: string } & Readonly<Record<string, unknown>> {
  return typeof node === 'object' && node !== null && typeof (node as { text?: unknown }).text === 'string';
}

export function findMarkRun(
  children: readonly unknown[],
  index: number,
  offset: number,
  key: string
): MarkRun | null {
  const current = children[index];
  if (!isText(current) || current[key] == null) {
    return null;
  }
  const value = current[key];
  const isSameMark = (node: unknown) => isText(node) && node[key] === value;

  let start = index;
  while (start > 0 && isSameMark(children[start - 1])) {
    start -= 1;
  }
  let end = index;
  while (end < children.length - 1 && isSameMark(children[end + 1])) {
    end += 1;
  }

  const lengthOf = (from: number, to: number) =>
    children.slice(from, to).reduce<number>((sum, node) => sum + (isText(node) ? node.text.length : 0), 0);
  const position = lengthOf(start, index) + offset;
  // 端にいるときは、続けて打つ文字だけを変えたい場面なので、すでにある文字には触れない
  return position > 0 && position < lengthOf(start, end + 1) ? { start, end } : null;
}

export function getMarkRunRange(editor: SlateEditor, key: string): TRange | undefined {
  const { selection } = editor;
  if (!selection) {
    return undefined;
  }
  const { anchor, focus } = selection;
  if (anchor.offset !== focus.offset || anchor.path.join() !== focus.path.join()) {
    return undefined;
  }
  const parentPath = anchor.path.slice(0, -1);
  const parent = editor.api.node(parentPath)?.[0] as { children?: unknown[] } | undefined;
  const children = parent?.children ?? [];
  const run = findMarkRun(children, anchor.path[anchor.path.length - 1], anchor.offset, key);
  if (!run) {
    return undefined;
  }
  const last = children[run.end];
  return {
    anchor: { path: [...parentPath, run.start], offset: 0 },
    focus: { path: [...parentPath, run.end], offset: isText(last) ? last.text.length : 0 },
  };
}
