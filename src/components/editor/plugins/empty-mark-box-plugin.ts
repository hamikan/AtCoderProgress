'use client';

import { KEYS, type NodeEntry, RangeApi, type SlateEditor, TextApi, type TText } from 'platejs';
import { createPlatePlugin } from 'platejs/react';

import { findEmptyBoxMarks } from '@/lib/plate/empty-mark-box';

const BOX_MARK_KEYS = [KEYS.code, KEYS.kbd];

function getCursorText(editor: SlateEditor): NodeEntry<TText> | undefined {
  const { selection } = editor;
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return undefined;
  }
  const entry = editor.api.node(selection.anchor.path);
  return entry && TextApi.isText(entry[0]) ? (entry as NodeEntry<TText>) : undefined;
}

export const EmptyMarkBoxPlugin = createPlatePlugin({
  key: 'emptyMarkBox',
  handlers: {
    onKeyDown: ({ editor, event }) => {
      if (
        event.key !== 'Enter' ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.nativeEvent.isComposing
      ) {
        return;
      }
      const entry = getCursorText(editor);
      if (!entry) {
        return;
      }
      const keys = findEmptyBoxMarks(entry[0], editor.marks, BOX_MARK_KEYS);
      if (keys.length === 0) {
        return;
      }
      // 何も書いていない箱で Enter を押したら、下の行へ移らずにその箱を消す
      event.preventDefault();
      editor.tf.withoutNormalizing(() => {
        keys.forEach((key) => editor.tf.removeMark(key));
      });
      return true;
    },
  },
}).overrideEditor(({ editor, tf: { removeMark } }) => ({
  transforms: {
    removeMark(key) {
      const entry = getCursorText(editor);
      // 空の行の文字に付いた印は、打つ前の印だけ外してもカーソルが動くと箱が戻るため、文字からも外す
      if (entry && entry[0].text === '' && entry[0][key]) {
        editor.tf.unsetNodes(key, { at: entry[1] });
      }
      removeMark(key);
    },
  },
}));
