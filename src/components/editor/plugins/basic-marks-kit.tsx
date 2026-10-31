'use client';

import {
  BoldRules,
  CodeRules,
  HighlightRules,
  ItalicRules,
  StrikethroughRules,
  SubscriptRules,
  SuperscriptRules,
  UnderlineRules,
} from '@platejs/basic-nodes';
import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { createMarkInputRule, KEYS } from 'platejs';

import { CodeLeaf } from '@/components/ui/code-node';
import { HighlightLeaf } from '@/components/ui/highlight-node';
import { KbdLeaf } from '@/components/ui/kbd-node';

import { notInCodeBlock } from './input-rule-guard';

export const BasicMarksKit = [
  BoldPlugin.configure({
    inputRules: [
      BoldRules.markdown({ enabled: notInCodeBlock, variant: '*' }),
      // Keep the legacy compound delimiters; Plate 53's combo factories differ.
      createMarkInputRule({
        enabled: notInCodeBlock,
        end: '**',
        marks: [KEYS.bold, KEYS.italic],
        start: '***',
        trigger: '*',
      }),
      createMarkInputRule({
        enabled: notInCodeBlock,
        end: '**_',
        marks: [KEYS.underline, KEYS.bold],
        start: '__**',
        trigger: '_',
      }),
      createMarkInputRule({
        enabled: notInCodeBlock,
        end: '***__',
        marks: [KEYS.underline, KEYS.bold, KEYS.italic],
        start: '___***',
        trigger: '_',
      }),
      createMarkInputRule({
        enabled: notInCodeBlock,
        end: '*_',
        marks: [KEYS.underline, KEYS.italic],
        start: '__*',
        trigger: '_',
      }),
    ],
  }),
  ItalicPlugin.configure({
    inputRules: [
      ItalicRules.markdown({ enabled: notInCodeBlock, variant: '*' }),
      ItalicRules.markdown({ enabled: notInCodeBlock, variant: '_' }),
    ],
  }),
  UnderlinePlugin.configure({
    inputRules: [UnderlineRules.markdown({ enabled: notInCodeBlock })],
  }),
  CodePlugin.configure({
    inputRules: [CodeRules.markdown({ enabled: notInCodeBlock })],
    node: { component: CodeLeaf },
    shortcuts: { toggle: { keys: 'mod+e' } },
  }),
  StrikethroughPlugin.configure({
    inputRules: [StrikethroughRules.markdown({ enabled: notInCodeBlock })],
    shortcuts: { toggle: { keys: 'mod+shift+x' } },
  }),
  SubscriptPlugin.configure({
    inputRules: [SubscriptRules.markdown({ enabled: notInCodeBlock })],
    shortcuts: { toggle: { keys: 'mod+comma' } },
  }),
  SuperscriptPlugin.configure({
    inputRules: [SuperscriptRules.markdown({ enabled: notInCodeBlock })],
    shortcuts: { toggle: { keys: 'mod+period' } },
  }),
  HighlightPlugin.configure({
    inputRules: [
      HighlightRules.markdown({ enabled: notInCodeBlock, variant: '==' }),
      HighlightRules.markdown({ enabled: notInCodeBlock, variant: '≡' }),
    ],
    node: { component: HighlightLeaf },
    shortcuts: { toggle: { keys: 'mod+shift+h' } },
  }),
  KbdPlugin.withComponent(KbdLeaf),
];
