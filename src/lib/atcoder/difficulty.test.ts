import assert from 'node:assert/strict';
import test from 'node:test';

import { getDifficultyColor } from './difficulty';

test('getDifficultyColor maps AtCoder difficulty bands', () => {
  assert.deepEqual(
    [null, 0, 400, 800, 1200, 1600, 2000, 2400, 2800].map(
      getDifficultyColor
    ),
    [
      'text-[#808080]',
      'text-[#808080]',
      'text-[#804000]',
      'text-[#008000]',
      'text-[#00C0C0]',
      'text-[#0000FF]',
      'text-[#C0C000]',
      'text-[#FF8000]',
      'text-[#FF0000]',
    ]
  );
});
