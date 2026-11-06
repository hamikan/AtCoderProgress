interface ContentNode {
  type?: unknown;
  text?: unknown;
  children?: unknown;
}

// エディタが中身を整えると何も書いていなくても文字列が変わるため、文字列ではなく中身で比べる
export function isEmptySolutionContent(content: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return false;
  }
  if (!Array.isArray(parsed)) {
    return false;
  }
  return parsed.every((node) => isEmptyNode(node as ContentNode));
}

function isEmptyNode(node: ContentNode): boolean {
  if (typeof node.text === 'string') {
    return node.text === '';
  }
  if (node.type !== 'p') {
    return false;
  }
  if (!Array.isArray(node.children)) {
    return false;
  }
  return node.children.every((child) => isEmptyNode(child as ContentNode));
}
