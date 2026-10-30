'use client';

import {
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
} from '@platejs/list';
import { ListPlugin } from '@platejs/list/react';
import { KEYS } from 'platejs';

import { IndentKit } from '@/components/editor/plugins/indent-kit';
import { BlockList } from '@/components/ui/block-list';

import { notInCodeBlock } from './input-rule-guard';

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
        KEYS.img,
      ],
    },
    inputRules: [
      BulletedListRules.markdown({ enabled: notInCodeBlock, variant: '-' }),
      BulletedListRules.markdown({ enabled: notInCodeBlock, variant: '*' }),
      OrderedListRules.markdown({ enabled: notInCodeBlock, variant: '.' }),
      OrderedListRules.markdown({ enabled: notInCodeBlock, variant: ')' }),
      TaskListRules.markdown({ checked: false, enabled: notInCodeBlock }),
      TaskListRules.markdown({ checked: true, enabled: notInCodeBlock }),
    ],
    render: {
      belowNodes: BlockList,
    },
  }),
];
