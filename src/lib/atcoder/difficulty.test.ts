import assert from 'node:assert/strict';
import test from 'node:test';

import { getDifficultyColor, getDifficultyOrbColor } from './difficulty';

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

test('getDifficultyOrbColor uses the same bands as background colors', () => {
  assert.deepEqual(
    [null, 0, 400, 800, 1200, 1600, 2000, 2400, 2800].map(
      getDifficultyOrbColor
    ),
    [
      'bg-[#808080]',
      'bg-[#808080]',
      'bg-[#804000]',
      'bg-[#008000]',
      'bg-[#00C0C0]',
      'bg-[#0000FF]',
      'bg-[#C0C000]',
      'bg-[#FF8000]',
      'bg-[#FF0000]',
    ]
  );
});
