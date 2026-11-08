import assert from 'node:assert/strict';
import test from 'node:test';

import { findEmptyBoxMarks } from './empty-mark-box';

const BOX_KEYS = ['code', 'kbd'];

test('finds the box marks on an empty text', () => {
  assert.deepEqual(findEmptyBoxMarks({ text: '', code: true }, null, BOX_KEYS), ['code']);
  assert.deepEqual(
    findEmptyBoxMarks({ text: '', code: true, kbd: true, bold: true }, null, BOX_KEYS),
    ['code', 'kbd']
  );
});

test('finds a box that is only waiting to be typed into', () => {
  assert.deepEqual(findEmptyBoxMarks({ text: 'abc' }, { kbd: true }, BOX_KEYS), ['kbd']);
  assert.deepEqual(
    findEmptyBoxMarks({ text: 'abc', code: true }, { code: true, bold: true }, BOX_KEYS),
    ['code']
  );
});

test('leaves boxes that already have text alone', () => {
  assert.deepEqual(findEmptyBoxMarks({ text: 'abc', code: true }, null, BOX_KEYS), []);
  assert.deepEqual(
    findEmptyBoxMarks({ text: 'abc', code: true }, { code: true }, BOX_KEYS),
    []
  );
});

test('ignores empty texts and waiting marks without a box', () => {
  assert.deepEqual(findEmptyBoxMarks({ text: '' }, null, BOX_KEYS), []);
  assert.deepEqual(findEmptyBoxMarks({ text: '', code: true }, {}, BOX_KEYS), []);
  assert.deepEqual(findEmptyBoxMarks({ text: 'abc' }, { bold: true }, BOX_KEYS), []);
});
