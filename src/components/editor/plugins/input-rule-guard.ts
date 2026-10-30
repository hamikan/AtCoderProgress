import { KEYS, type SlateEditor } from 'platejs';

/**
 * Shared `enabled` guard for input rules.
 *
 * Replaces the global `query` that the old AutoformatPlugin applied to every
 * rule: input rules must not run while the selection is inside a code block.
 */
export const notInCodeBlock = ({ editor }: { editor: SlateEditor }): boolean =>
  !editor.api.some({ match: { type: editor.getType(KEYS.codeBlock) } });
