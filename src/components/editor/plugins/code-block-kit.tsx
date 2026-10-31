'use client';

import { CodeBlockRules } from '@platejs/code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react';

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/components/ui/code-block-node';
import { createCodeBlockHighlighter } from '@/lib/plate/code-block-highlighter';

import { notInCodeBlock } from './input-rule-guard';

const lowlight = createCodeBlockHighlighter();

export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    inputRules: [
      CodeBlockRules.markdown({ enabled: notInCodeBlock, on: 'match' }),
    ],
    node: { component: CodeBlockElement },
    options: { defaultLanguage: 'auto', lowlight },
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
];
