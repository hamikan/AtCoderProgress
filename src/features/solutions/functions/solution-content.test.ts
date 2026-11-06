import assert from 'node:assert/strict';
import test from 'node:test';

import { isEmptySolutionContent } from './solution-content';

test('treats the untouched default document as empty', () => {
  assert.equal(
    isEmptySolutionContent(
      JSON.stringify([{ type: 'p', children: [{ text: '' }] }])
    ),
    true
  );
});

test('treats normalized empty paragraphs as empty', () => {
  assert.equal(
    isEmptySolutionContent(
      JSON.stringify([
        { type: 'p', id: 'abc', children: [{ text: '' }] },
        { type: 'p', children: [{ text: '' }, { text: '', bold: true }] },
      ])
    ),
    true
  );
});

test('treats any text as content', () => {
  assert.equal(
    isEmptySolutionContent(
      JSON.stringify([{ type: 'p', children: [{ text: '解法' }] }])
    ),
    false
  );
});

test('treats non-paragraph blocks as content even without text', () => {
  assert.equal(
    isEmptySolutionContent(
      JSON.stringify([
        { type: 'p', children: [{ text: '' }] },
        { type: 'img', url: 'https://example.com/a.png', children: [{ text: '' }] },
      ])
    ),
    false
  );
});

test('treats unparseable content as content', () => {
  assert.equal(isEmptySolutionContent('not json'), false);
});
