import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDifficultyCircleStyle,
  getDifficultyColor,
  getDifficultyOrbColor,
} from './difficulty';

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

test('getDifficultyCircleStyle fills the circle by progress within the band', () => {
  assert.deepEqual(getDifficultyCircleStyle(1220), {
    borderColor: '#00C0C0',
    background: 'linear-gradient(to top, #00C0C0 5%, transparent 5%)',
  });
  assert.deepEqual(getDifficultyCircleStyle(399), {
    borderColor: '#808080',
    background: 'linear-gradient(to top, #808080 100%, transparent 100%)',
  });
  assert.deepEqual(getDifficultyCircleStyle(2800), {
    borderColor: '#FF0000',
    background: 'linear-gradient(to top, #FF0000 0%, transparent 0%)',
  });
});

test('getDifficultyCircleStyle uses bronze, silver and gold from 3200', () => {
  assert.deepEqual(
    [3200, 3600, 4000].map((difficulty) => getDifficultyCircleStyle(difficulty).borderColor),
    ['#965C2C', '#808080', '#FFD700']
  );
});
