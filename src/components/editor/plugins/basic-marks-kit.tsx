'use client';

import {
  BoldRules,
  CodeRules,
  HighlightRules,
  ItalicRules,
  MarkComboRules,
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

import { CodeLeaf } from '@/components/ui/code-node';
import { HighlightLeaf } from '@/components/ui/highlight-node';
import { KbdLeaf } from '@/components/ui/kbd-node';

import { notInCodeBlock } from './input-rule-guard';

export const BasicMarksKit = [
  BoldPlugin.configure({
    inputRules: [
      BoldRules.markdown({ enabled: notInCodeBlock, variant: '*' }),
      MarkComboRules.markdown({
        enabled: notInCodeBlock,
        variant: 'boldItalic',
      }),
      MarkComboRules.markdown({
        enabled: notInCodeBlock,
        variant: 'boldUnderline',
      }),
      MarkComboRules.markdown({
        enabled: notInCodeBlock,
        variant: 'boldItalicUnderline',
      }),
      MarkComboRules.markdown({
        enabled: notInCodeBlock,
        variant: 'italicUnderline',
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
