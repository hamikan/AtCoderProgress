import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import {
  BaseCodeBlockPlugin,
  codeBlockToDecorations,
} from '@platejs/code-block';
import { all, createLowlight } from 'lowlight';
import { createSlateEditor, type TCodeBlockElement } from 'platejs';

import {
  CODE_BLOCK_AUTO_LANGUAGES,
  CODE_BLOCK_HIGHLIGHT_CACHE_MAX_CHARACTERS,
  CODE_BLOCK_HIGHLIGHT_CACHE_MAX_ENTRIES,
  createCodeBlockHighlighter,
} from './code-block-highlighter';

type Lowlight = ReturnType<typeof createLowlight>;
type HighlightTree = ReturnType<Lowlight['highlightAuto']>;

function tree(value: string): HighlightTree {
  return { type: 'root', children: [{ type: 'text', value }] };
}

function createObservedHighlighter() {
  const highlightAuto = mock.fn<Lowlight['highlightAuto']>((value) => tree(value));
  const original = { ...createLowlight(), highlightAuto };
  return {
    highlighter: createCodeBlockHighlighter(() => original),
    highlightAuto,
    original,
  };
}

test('Auto limits detection to the eight supported default candidates', () => {
  const { highlighter, highlightAuto, original } = createObservedHighlighter();
  highlighter.highlightAuto('int main() { return 0; }');

  assert.deepEqual(CODE_BLOCK_AUTO_LANGUAGES, [
    'cpp', 'python', 'java', 'javascript', 'typescript', 'rust', 'go', 'csharp',
  ]);
  assert.deepEqual(highlightAuto.mock.calls[0].arguments[1], {
    subset: CODE_BLOCK_AUTO_LANGUAGES,
  });
  assert.notEqual(highlighter, original);
  assert.equal(original.highlightAuto, highlightAuto);
});

test('Auto reuses the same content, including empty content and null options', () => {
  const { highlighter, highlightAuto } = createObservedHighlighter();
  const first = highlighter.highlightAuto('print(1)');

  assert.equal(highlighter.highlightAuto('print(1)'), first);
  assert.equal(highlighter.highlightAuto('print(1)', null), first);
  assert.equal(highlighter.highlightAuto(''), highlighter.highlightAuto(''));
  assert.equal(highlightAuto.mock.callCount(), 2);
});

test('Auto recalculates changed content without changing a previous result', () => {
  const { highlighter, highlightAuto } = createObservedHighlighter();
  const previous = highlighter.highlightAuto('print(1)');
  const changed = highlighter.highlightAuto('print(2)');

  assert.notEqual(changed, previous);
  assert.deepEqual(previous, tree('print(1)'));
  assert.deepEqual(changed, tree('print(2)'));
  assert.equal(highlightAuto.mock.callCount(), 2);
});

test('Auto evicts the least recently used content at the cache entry limit', () => {
  const { highlighter, highlightAuto } = createObservedHighlighter();
  const values = Array.from(
    { length: CODE_BLOCK_HIGHLIGHT_CACHE_MAX_ENTRIES },
    (_, index) => `code ${index}`
  );
  for (const value of values) highlighter.highlightAuto(value);

  highlighter.highlightAuto(values[0]);
  highlighter.highlightAuto('new code');
  highlighter.highlightAuto(values[0]);
  assert.equal(highlightAuto.mock.callCount(), values.length + 1);

  highlighter.highlightAuto(values[1]);
  assert.equal(highlightAuto.mock.callCount(), values.length + 2);
});

test('Auto caches content at the size limit and skips larger content', () => {
  const { highlighter, highlightAuto } = createObservedHighlighter();
  const atLimit = 'a'.repeat(CODE_BLOCK_HIGHLIGHT_CACHE_MAX_CHARACTERS);
  const aboveLimit = `${atLimit}a`;

  highlighter.highlightAuto(atLimit);
  highlighter.highlightAuto(atLimit);
  highlighter.highlightAuto(aboveLimit);
  highlighter.highlightAuto(aboveLimit);

  assert.equal(highlightAuto.mock.callCount(), 3);
  assert.deepEqual(highlighter.highlightAuto(atLimit), tree(atLimit));
  assert.equal(highlightAuto.mock.callCount(), 3);
});

test('Auto forwards custom options and keeps them separate from cached defaults', () => {
  const { highlighter, highlightAuto } = createObservedHighlighter();
  const source = 'example';
  const defaultResult = highlighter.highlightAuto(source);
  const options = Object.freeze({ prefix: 'custom-', subset: ['bash'] });

  highlighter.highlightAuto(source, options);
  highlighter.highlightAuto(source, options);
  highlighter.highlightAuto(source, { prefix: 'prefix-only-' });
  highlighter.highlightAuto(source, { subset: null });

  assert.equal(highlightAuto.mock.callCount(), 5);
  assert.deepEqual(highlightAuto.mock.calls[1].arguments[1], options);
  assert.deepEqual(highlightAuto.mock.calls[3].arguments[1], {
    prefix: 'prefix-only-', subset: CODE_BLOCK_AUTO_LANGUAGES,
  });
  assert.deepEqual(highlightAuto.mock.calls[4].arguments[1], { subset: null });
  assert.equal(highlighter.highlightAuto(source), defaultResult);
  assert.equal(highlightAuto.mock.callCount(), 5);
});

test('Auto retries after a highlighting failure instead of caching the failure', () => {
  const highlightAuto = mock.fn<Lowlight['highlightAuto']>((value) => {
    if (highlightAuto.mock.callCount() === 0) throw new Error('highlight failed');
    return tree(value);
  });
  const highlighter = createCodeBlockHighlighter(() => ({
    ...createLowlight(), highlightAuto,
  }));

  assert.throws(() => highlighter.highlightAuto('retry'), /highlight failed/);
  const recovered = highlighter.highlightAuto('retry');
  assert.equal(highlighter.highlightAuto('retry'), recovered);
  assert.equal(highlightAuto.mock.callCount(), 2);
});

test('highlighter preserves all original manual language APIs', () => {
  const { highlighter, original } = createObservedHighlighter();

  assert.equal(highlighter.highlight, original.highlight);
  assert.equal(highlighter.listLanguages, original.listLanguages);
  assert.equal(highlighter.register, original.register);
  assert.equal(highlighter.registerAlias, original.registerAlias);
  assert.equal(highlighter.registered, original.registered);
});

test('highlighter instances keep independent result caches', () => {
  const first = createObservedHighlighter();
  const second = createObservedHighlighter();

  first.highlighter.highlightAuto('same');
  first.highlighter.highlightAuto('same');
  second.highlighter.highlightAuto('same');

  assert.equal(first.highlightAuto.mock.callCount(), 1);
  assert.equal(second.highlightAuto.mock.callCount(), 1);
});

test('real Lowlight retains every registered language for manual highlighting', () => {
  const highlighter = createCodeBlockHighlighter();

  assert.ok(highlighter.listLanguages().length > CODE_BLOCK_AUTO_LANGUAGES.length);
  assert.equal(highlighter.registered('bash'), true);
  assert.equal(highlighter.highlight('bash', 'echo "$HOME"').data?.language, 'bash');
  assert.equal(highlighter.highlight('c++', 'int main() { return 0; }').data?.language, 'c++');
  for (const language of CODE_BLOCK_AUTO_LANGUAGES) {
    assert.equal(highlighter.registered(language), true);
  }
});

test('real Lowlight Auto produces syntax trees and respects custom prefix/subset', () => {
  const highlighter = createCodeBlockHighlighter();
  const source = '#include <iostream>\nint main() { std::cout << "hello"; return 0; }';
  const result = highlighter.highlightAuto(source);
  const custom = highlighter.highlightAuto(source, { prefix: 'custom-', subset: ['cpp'] });

  assert.equal(result.data?.language, 'cpp');
  assert.ok(result.children.length > 0);
  assert.equal(custom.data?.language, 'cpp');
  assert.match(JSON.stringify(custom), /custom-keyword/);
  assert.doesNotMatch(JSON.stringify(result), /custom-keyword/);
  assert.equal(highlighter.highlightAuto(source), result);
  assert.equal(
    highlighter.highlightAuto('echo "$HOME"', { subset: ['bash'] }).data?.language,
    'bash'
  );
});

test('Plate decorates unspecified/Auto code repeatedly and supports explicit other languages', () => {
  const original = createLowlight(all);
  const highlightAuto = mock.fn(original.highlightAuto);
  const lowlight = createCodeBlockHighlighter(() => ({ ...original, highlightAuto }));
  const editor = createSlateEditor({
    plugins: [BaseCodeBlockPlugin.configure({ options: { defaultLanguage: 'auto', lowlight } })],
  });
  const block: TCodeBlockElement = {
    type: 'code_block',
    children: [{ type: 'code_line', children: [{ text: 'int main() { return 0; }' }] }],
  };
  const first = codeBlockToDecorations(editor, [block, [0]]);

  assert.ok([...first.values()].flat().some(
    (range) => 'className' in range && range.className === 'hljs-keyword'
  ));
  assert.deepEqual(codeBlockToDecorations(editor, [block, [0]]), first);
  assert.deepEqual(codeBlockToDecorations(editor, [{ ...block, lang: 'auto' }, [0]]), first);
  const normalized: TCodeBlockElement = {
    ...block,
    id: 'code-block-id',
    children: block.children.map((line) => ({ ...line, id: 'code-line-id' })),
  };
  assert.deepEqual(
    [...codeBlockToDecorations(editor, [normalized, [0]]).values()],
    [...first.values()]
  );
  assert.equal(highlightAuto.mock.callCount(), 1);

  const manual: TCodeBlockElement = {
    ...block,
    lang: 'bash',
    children: [{ type: 'code_line', children: [{ text: 'echo "$HOME"' }] }],
  };
  const manualRanges = [...codeBlockToDecorations(editor, [manual, [0]]).values()].flat();
  assert.ok(manualRanges.some(
    (range) => 'className' in range && String(range.className).startsWith('hljs-')
  ));

  const plaintextRanges = [...codeBlockToDecorations(
    editor, [{ ...block, lang: 'plaintext' }, [0]]
  ).values()].flat();
  assert.equal(plaintextRanges.length, 0);
  assert.equal(highlightAuto.mock.callCount(), 1);
});
