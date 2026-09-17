import assert from 'node:assert/strict';
import test from 'node:test';

import { formatDifficulty, formatSigned } from './format';

test('account journey formatters handle positive, zero, and missing values', () => {
  assert.equal(formatSigned(100), '+100');
  assert.equal(formatSigned(0), '0');
  assert.equal(formatSigned(null), '-');
  assert.equal(formatDifficulty(1200), '1,200');
  assert.equal(formatDifficulty(null), 'N/A');
});
