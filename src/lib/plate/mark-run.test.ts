import assert from 'node:assert/strict';
import test from 'node:test';

import { findMarkRun } from './mark-run';

const KEY = 'backgroundColor';
const CHILDREN = [
  { text: 'a' },
  { text: 'bc', backgroundColor: 'yellow' },
  { text: 'de', backgroundColor: 'yellow', bold: true },
  { text: 'f', backgroundColor: 'red' },
  { text: 'g' },
];

test('finds the whole run of the same color around the cursor', () => {
  assert.deepEqual(findMarkRun(CHILDREN, 1, 1, KEY), { start: 1, end: 2 });
  assert.deepEqual(findMarkRun(CHILDREN, 2, 0, KEY), { start: 1, end: 2 });
  assert.deepEqual(findMarkRun(CHILDREN, 2, 1, KEY), { start: 1, end: 2 });
});

test('leaves the cursor at either end of the run to the next typed text', () => {
  assert.equal(findMarkRun(CHILDREN, 1, 0, KEY), null);
  assert.equal(findMarkRun(CHILDREN, 2, 2, KEY), null);
});

test('ignores text without the mark', () => {
  assert.equal(findMarkRun(CHILDREN, 0, 0, KEY), null);
  assert.equal(findMarkRun(CHILDREN, 4, 1, KEY), null);
});

test('stops at a different value or a non-text child', () => {
  const children = [
    { text: 'ab', backgroundColor: 'red' },
    { type: 'a', children: [{ text: 'link' }] },
    { text: 'cd', backgroundColor: 'red' },
  ];
  assert.deepEqual(findMarkRun(children, 0, 1, KEY), { start: 0, end: 0 });
  assert.equal(findMarkRun(CHILDREN, 3, 0, KEY), null);
});
