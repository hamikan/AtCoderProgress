import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHeatmapStats } from './build-heatmap-stats';

const day = (date: string, count: number) => ({
  date,
  count,
  level: count === 0 ? 0 : 1,
});

test('buildHeatmapStats totals ACs, finds the longest streak and averages per day', () => {
  const stats = buildHeatmapStats([
    day('2026-01-01', 2),
    day('2026-01-02', 1),
    day('2026-01-03', 0),
    day('2026-01-04', 3),
    day('2026-01-05', 1),
    day('2026-01-06', 1),
  ]);

  assert.equal(stats.totalAC, 8);
  assert.equal(stats.maxStreak, 3);
  assert.equal(stats.dailyAverage, '1.3');
});

test('buildHeatmapStats handles empty data', () => {
  assert.deepEqual(buildHeatmapStats([]), {
    totalAC: 0,
    maxStreak: 0,
    dailyAverage: '0.0',
  });
});
