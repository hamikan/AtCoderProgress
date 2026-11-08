'use client';

import { ElementApi, KEYS, type SlateEditor, type TElement } from 'platejs';
import { TogglePlugin } from '@platejs/toggle/react';

import { IndentKit } from '@/components/editor/plugins/indent-kit';
import { ToggleElement } from '@/components/ui/toggle-node';

const LIST_PROP_KEYS = [
  KEYS.listType,
  KEYS.listStart,
  KEYS.listRestart,
  KEYS.listRestartPolite,
  KEYS.listChecked,
];

// リストは1段目を indent 1 で表すので、トグルにするときは1段浅くして同じ深さに見せる
function removeListProps(editor: SlateEditor) {
  for (const [node, path] of editor.api.blocks<TElement>({ mode: 'lowest' })) {
    if (!node[KEYS.listType]) continue;
    editor.tf.unsetNodes(LIST_PROP_KEYS, { at: path });
    const indent = typeof node.indent === 'number' ? node.indent - 1 : 0;
    if (indent > 0) {
      editor.tf.setNodes({ indent }, { at: path });
    } else {
      editor.tf.unsetNodes(KEYS.indent, { at: path });
    }
  }
}

export const ToggleKit = [
  ...IndentKit,
  TogglePlugin.withComponent(ToggleElement).overrideEditor(
    ({ editor, tf: { insertBreak, normalizeNode, toggleBlock } }) => ({
      transforms: {
        insertBreak() {
          const entry = editor.api.block();
          // 見出しなどと同じく、何も書いていないトグルで改行したら普通の行に戻す。入れ子の深さは保つ
          if (entry && entry[0].type === KEYS.toggle && editor.api.isEmpty(entry[0])) {
            editor.tf.setNodes({ type: editor.getType(KEYS.p) }, { at: entry[1] });
            return;
          }
          insertBreak();
        },
        normalizeNode(entry) {
          const [node, path] = entry;
          // リストのボタンや「1. 」でトグルに番号が付くと、番号とトグルの印が重なるため、リストの行に置き換える
          if (ElementApi.isElement(node) && node.type === KEYS.toggle && node[KEYS.listType]) {
            editor.tf.setNodes({ type: editor.getType(KEYS.p) }, { at: path });
            return;
          }
          normalizeNode(entry);
        },
        toggleBlock(type, options) {
          // 番号や・を残したままトグルにすると normalizeNode でリストの行に戻されるため、先に外して置き換える
          if (type === KEYS.toggle) {
            editor.tf.withoutNormalizing(() => {
              removeListProps(editor);
              toggleBlock(type, options);
            });
            return;
          }
          toggleBlock(type, options);
        },
      },
    })
  ),
];
