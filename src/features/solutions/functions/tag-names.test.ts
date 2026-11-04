import assert from 'node:assert/strict';
import test from 'node:test';

import { dedupeTagNamesByCase } from './tag-names';

test('drops names that differ only in case, keeping the first', () => {
  assert.deepEqual(dedupeTagNamesByCase(['DP', 'dp', 'Dp', '数学']), [
    'DP',
    '数学',
  ]);
});

test('keeps distinct names and order', () => {
  assert.deepEqual(dedupeTagNamesByCase(['b', 'A', 'c']), ['b', 'A', 'c']);
  assert.deepEqual(dedupeTagNamesByCase([]), []);
});
