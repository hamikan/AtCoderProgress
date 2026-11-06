import assert from 'node:assert/strict';
import test from 'node:test';

import { formatProblemDisplayName } from './problem-name';

test('formatProblemDisplayName builds "ABC 269 F - Numbered Cards" style labels', () => {
  assert.equal(
    formatProblemDisplayName('abc269', 'abc269_f', 'Numbered Cards'),
    'ABC 269 F - Numbered Cards'
  );
  assert.equal(
    formatProblemDisplayName('arc104', 'arc104_b', 'DNA Sequence'),
    'ARC 104 B - DNA Sequence'
  );
  assert.equal(
    formatProblemDisplayName('abc269', 'abc269_ex', 'Anticon'),
    'ABC 269 Ex - Anticon'
  );
});

test('formatProblemDisplayName falls back when the problem id has no index suffix', () => {
  assert.equal(
    formatProblemDisplayName('abc269', 'abc269', 'Numbered Cards'),
    'ABC 269 - Numbered Cards'
  );
  assert.equal(
    formatProblemDisplayName('abc269', 'other_x', 'Numbered Cards'),
    'ABC 269 - Numbered Cards'
  );
});
