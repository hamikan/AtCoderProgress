'use client';

import { KEYS } from 'platejs';
import { TogglePlugin } from '@platejs/toggle/react';

import { IndentKit } from '@/components/editor/plugins/indent-kit';
import { ToggleElement } from '@/components/ui/toggle-node';

export const ToggleKit = [
  ...IndentKit,
  TogglePlugin.withComponent(ToggleElement).overrideEditor(({ editor, tf: { insertBreak } }) => ({
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
    },
  })),
];
