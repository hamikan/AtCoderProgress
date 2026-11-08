'use client';

import { KEYS } from 'platejs';
import { BlockPlaceholderPlugin } from 'platejs/react';

export const BlockPlaceholderKit = [
  BlockPlaceholderPlugin.configure({
    options: {
      // 文字の始まりに置くと右揃えや中央揃えの行ではみ出すため、行の幅いっぱいに広げて揃え方に従わせる
      className:
        'relative before:absolute before:inset-x-0 before:cursor-text before:text-muted-foreground/80 before:content-[attr(placeholder)]',
      placeholders: {
        [KEYS.p]: 'Type something...',
      },
      query: ({ path }) => path.length === 1,
    },
  }),
];
