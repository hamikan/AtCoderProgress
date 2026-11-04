interface ContentNode {
  type?: unknown;
  text?: unknown;
  children?: unknown;
}

/**
 * Whether serialized editor content carries nothing worth saving:
 * only empty paragraphs. Editor normalization can change the exact
 * JSON string of an untouched document, so this compares meaning,
 * not the raw string.
 */
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
  // Anything that is not a plain paragraph (an image, a code block, a
  // heading the user inserted, ...) counts as content.
  if (node.type !== 'p') {
    return false;
  }
  if (!Array.isArray(node.children)) {
    return false;
  }
  return node.children.every((child) => isEmptyNode(child as ContentNode));
}
