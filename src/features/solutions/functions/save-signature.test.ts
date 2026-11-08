import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSaveSignature,
  getUnflushedPayload,
} from './save-signature';
import type { SavePayload } from '@/features/solutions/types';

const PAYLOAD: SavePayload = {
  problemId: 'abc001_a',
  contestId: 'abc001',
  title: null,
  content: '[{"type":"p","children":[{"text":"メモ"}]}]',
  status: 'UNSET',
  tagNames: [],
};

test('getUnflushedPayload returns input still inside the debounce window', () => {
  assert.equal(getUnflushedPayload(PAYLOAD, null), PAYLOAD);
  assert.equal(
    getUnflushedPayload(PAYLOAD, buildSaveSignature({ ...PAYLOAD, content: '[]' })),
    PAYLOAD
  );
});

test('getUnflushedPayload returns null once the payload is handled', () => {
  assert.equal(
    getUnflushedPayload(PAYLOAD, buildSaveSignature(PAYLOAD)),
    null
  );
  assert.equal(getUnflushedPayload(null, null), null);
});

test('buildSaveSignature changes with any saved field', () => {
  const base = buildSaveSignature(PAYLOAD);
  assert.notEqual(buildSaveSignature({ ...PAYLOAD, title: '題' }), base);
  assert.notEqual(buildSaveSignature({ ...PAYLOAD, status: 'TRYING' }), base);
  assert.notEqual(buildSaveSignature({ ...PAYLOAD, tagNames: ['DP'] }), base);
  assert.notEqual(
    buildSaveSignature({ ...PAYLOAD, problemId: 'abc001_b' }),
    base
  );
});
