import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTagChoices,
  filterTagChoices,
  findTagToCreate,
  normalizeTagName,
} from './solution-tags';

const AVAILABLE = [
  { id: '1', name: 'BFS', usageCount: 1 },
  { id: '2', name: 'DP', usageCount: 5 },
  { id: '3', name: '二分探索', usageCount: 5 },
  { id: '4', name: '実装', usageCount: 0 },
];

test('normalizeTagName trims and collapses spaces', () => {
  assert.equal(normalizeTagName('  segment   tree '), 'segment tree');
});

test('buildTagChoices orders by usage and keeps unsaved selections', () => {
  const choices = buildTagChoices(AVAILABLE, ['dp', '新しいタグ']);
  assert.deepEqual(
    choices.map((choice) => choice.name),
    ['DP', '二分探索', 'BFS', '実装', '新しいタグ']
  );
});

test('filterTagChoices matches without case', () => {
  const choices = buildTagChoices(AVAILABLE, []);
  assert.deepEqual(
    filterTagChoices(choices, 'b').map((choice) => choice.name),
    ['BFS']
  );
  assert.equal(filterTagChoices(choices, '').length, choices.length);
});

test('findTagToCreate offers a new name only when nothing matches exactly', () => {
  const choices = buildTagChoices(AVAILABLE, []);
  assert.equal(findTagToCreate(choices, ' 幾何 '), '幾何');
  assert.equal(findTagToCreate(choices, 'dp'), null);
  assert.equal(findTagToCreate(choices, '   '), null);
});
