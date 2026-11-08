import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findExistingTagName,
  findTagToCreate,
  listTagsToAdd,
  normalizeTagName,
  rankTagsByUsage,
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

test('listTagsToAdd keeps the opening order and hides selected tags', () => {
  const ranking = rankTagsByUsage(AVAILABLE);
  assert.deepEqual(listTagsToAdd(AVAILABLE, ['dp'], ranking, ''), ['二分探索', 'BFS', '実装']);

  const recounted = AVAILABLE.map((tag) =>
    tag.name === '実装' ? { ...tag, usageCount: 9 } : tag
  );
  assert.deepEqual(listTagsToAdd(recounted, [], ranking, ''), ['DP', '二分探索', 'BFS', '実装']);
});

test('listTagsToAdd puts tags made after opening first', () => {
  const ranking = rankTagsByUsage(AVAILABLE);
  const withNewTag = [...AVAILABLE, { id: '5', name: '幾何', usageCount: 1 }];
  assert.deepEqual(listTagsToAdd(withNewTag, [], ranking, ''), [
    '幾何',
    'DP',
    '二分探索',
    'BFS',
    '実装',
  ]);
});

test('listTagsToAdd filters without case', () => {
  const ranking = rankTagsByUsage(AVAILABLE);
  assert.deepEqual(listTagsToAdd(AVAILABLE, [], ranking, 'b'), ['BFS']);
});

test('findExistingTagName and findTagToCreate match names without case', () => {
  assert.equal(findExistingTagName(AVAILABLE, [], 'dp'), 'DP');
  assert.equal(findExistingTagName(AVAILABLE, ['新しいタグ'], '新しいタグ'), '新しいタグ');
  assert.equal(findTagToCreate(AVAILABLE, [], ' 幾何 '), '幾何');
  assert.equal(findTagToCreate(AVAILABLE, [], 'dp'), null);
  assert.equal(findTagToCreate(AVAILABLE, ['新しいタグ'], '新しいタグ'), null);
  assert.equal(findTagToCreate(AVAILABLE, [], '   '), null);
});
